const { body, validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { Trail, TrailCoords, User, PointsOfInterest } = require("../models");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const { distance } = require("../utils/distance");
const {
  checkLengthOfObjectArrays,
  makeObjectArray,
} = require("../utils/helpers");
const { getImageLinks } = require("../utils/images");

// returns a list of all of the trails and the trail's points
exports.listTrails = async (req, res) => {
  const controller = "listTrails";
  try {
    trails = await Trail.findAll({ include: [TrailCoords, PointsOfInterest] });
    res.status(200).json(trails);
  } catch (err) {
    logger.debug(err, {
      controller,
      errorMsg: "listTrails Catch Error",
    });
    res.status(500).json(err);
  }
};

// How to save a trail:
// 1. Validation of data
//    a. ensure the data is of the correct type
//    b. ensure each poi has an image (req.files['poi'].length === req.poi.length)
// 2. save the trail and TrailCoords
// 3. save the Points of Interest
//    a. save the images (../public/images/poi/trailId/<image index>.jpg)
//    b. save the poi
exports.saveTrail = [
  // Trail validation
  body("createdBy", "Invalid data type, must be an integer")
    .isInt()
    .bail()
    .toInt()
    .custom(async (value) => {
      const user = await User.findByPk(value);
      if (!user) {
        throw new Error("UserID doesn't exist");
      }
    }),
  body("name", "Invalid data type, must be a string")
    .optional()
    .isString()
    .trim()
    .escape()
    .custom(async (value) => {
      const trail = await Trail.findAll({ where: { name: value } });
      if (trail.length > 0) {
        throw new Error(`Trail name, ${value}, is already in use`);
      }
    }),
  body("description", "Invalid data type, must be a string")
    .optional()
    .isString()
    .trim()
    .escape(),
  body("difficulty", "Invalid selection for difficulty")
    .exists()
    .withMessage("Difficulty field is required")
    .bail()
    .trim()
    .isIn(["easy", "moderate", "hard"]),
  body("isClosed", "isClosed must be true/false")
    .optional()
    .isBoolean()
    .toBoolean(),

  // Trail Points validation
  body()
    .custom((value) => {
      return checkLengthOfObjectArrays(value, "TrailCoords");
    })
    .withMessage("TrailCoords arrays must be the same length")
    .bail()
    .custom((value) => {
      value.TrailCoords = makeObjectArray(value, "TrailCoords");
      return true;
    }),
  body("TrailCoords", "There must be at least 2 points on the trail").isArray({
    min: 2,
  }),
  body(
    ["TrailCoords.*.latitude", "TrailCoords.*.longitude"],
    "Invalid data type, must be a float (#.#)"
  )
    .exists()
    .isFloat()
    .toFloat(),
  body(
    [
      "TrailCoords.*.accuracy.*",
      "TrailCoords.*.altitude.*",
      "TrailCoords.*.altitudeAccuracy.*",
      "TrailCoords.*.heading.*",
      "TrailCoords.*.speed.*",
    ],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // Points of Interest validation
  // This adds the files and then creates an array of POI objects back in to the req.body so the POI object can be validated normally
  body()
    .custom((value, { req }) => {
      const files = req.files.POI_image;
      if (files) {
        value.POI_files = files;
      }

      // Check to ensure all existing arrays are of the same length
      return checkLengthOfObjectArrays(value, "POI");
    })
    .withMessage("POI arrays must be the same length")
    .bail()
    .custom((value) => {
      value.POI = makeObjectArray(value, "POI");
      return true;
    }),
  body("POI").optional(),
  body("POI.*.description", "Invalid data type, must be a string")
    .exists()
    .isString()
    .trim()
    .escape(),
  body("POI.*.files")
    .exists()
    .custom((value) => {
      // check valid mime types
      const mimetypeArr = value.mimetype.split("/");

      return (
        mimetypeArr[0] === "image" &&
        VALID_IMAGE_TYPES.indexOf(mimetypeArr[1]) > -1
      );
    })
    .withMessage(`Files must be of type: .${VALID_IMAGE_TYPES.join(", .")}`),
  body("POI.*.isActive", "Point of Interest isActive must be true/false")
    .exists()
    .isBoolean()
    .toBoolean(),
  body(
    ["POI.*.latitude", "POI.*.longitude"],
    "Invalid data type, must be a float (#.#)"
  )
    .exists()
    .isFloat()
    .toFloat(),
  body(
    [
      "POI.*.accuracy",
      "POI.*.altitude",
      "POI.*.altitudeAccuracy",
      "POI.*.heading",
      "POI.*.speed",
    ],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // Finally, the actual function!
  async (req, res) => {
    console.log("************ Main Function ************"); //, req.files);
    console.log("req.body:\n", req.body, "\n****");

    const controller = "saveTrail";

    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array(), {
          controller,
          errorMsg: "validation error",
        });
        // res.status(400).json({ error: validationErrors(errors.array()) });
        res.status(400).json({ error: errors.array() });
        return;
      }

      const body = req.body;

      const newTrail = {
        name: body.name,
        description: body.description,
        difficulty: body.difficulty,
        isClosed: body.isClosed,
        createdBy: body.createdBy,
        TrailCoords: body.TrailCoords,
      };

      // clean coords? remove duplicates... check for backtracking?

      let dist = 0;
      for (let i = 0; i < newTrail.TrailCoords.length - 1; i++) {
        const a = newTrail.TrailCoords[i];
        const b = newTrail.TrailCoords[i + 1];

        dist += distance(a.latitude, a.longitude, b.latitude, b.longitude);
      }
      newTrail.distance = dist;

      // console.log("\nnewTrail:\n", newTrail, "\n\ndistance:", dist, "\n");

      // create the new trail
      const trail = await Trail.create(newTrail, {
        include: [Trail.TrailCoords, PointsOfInterest],
      });
      if (!trail) {
        throw new Error("No trail created.");
      }

      // Make Point of Interest array
      // images will be stored at /public/images/<Trail ID>/<POI || Hazard>/
      if (body.POI) {
        for (const point of body.POI) {
          // const link = getImageLinks(trail.trailId, point.files, "POI");
          point.trailId = trail.trailId;
          point.image = await getImageLinks(trail.trailId, point.files, "POI");
        }

        const pois = await PointsOfInterest.bulkCreate(body.POI);
        if (!pois) {
          throw new Error("No points of interest created.");
        }

        // repopulate trail with the POIs
        await trail.reload();
      }

      // ensure new trail returns an array (if only 1 item is returned)
      let trailArr = [];
      if (Array.isArray(trail)) {
        trailArr = trail;
      } else {
        trailArr = [trail];
      }

      logger.debug(JSON.stringify(trailArr), {
        controller,
        msg: "return data",
      });

      console.log(trailArr);
      // send the new trail back to the client
      // res.status(201).json(body.POI);
      res.status(201).json(trailArr);
      return;
    } catch (err) {
      logger.debug(err, {
        controller,
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err.message });
      return;
    }
  },
];
