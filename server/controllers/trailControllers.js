const { body, validationResult } = require("express-validator");
const sharp = require("sharp");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const {
  SAVE_DIRECTORY,
  QUALITY: quality,
  RESIZE,
  VALID_IMAGE_TYPES,
} = require("../config/imageUpload");
const { distance } = require("../utils/distance");
const { ensureDirExists, getFileName } = require("../utils/fileHelpers");

const { Trail, TrailCoords, User } = require("../models");
const {
  validationErrors,
  checkLengthOfObjectArrays,
  makeObjectArray,
} = require("../utils/helpers");

// returns a list of all of the trails and the trail's points
exports.listTrails = async (req, res) => {
  try {
    trails = await Trail.findAll({ include: TrailCoords });
    res.status(200).json(trails);
  } catch (err) {
    logger.debug(err, {
      controller: "listTrails",
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
  // POI is optional, however if 1 item exists, they all must exist and an image is required for each item. (use express-validator.check so I have access to req.files and not just req.body) All existence error checking is done here. Type checking and sanitization will be done later.
  body()
    .custom((value, { req }) => {
      // console.log("************ POI Validation ************");
      // Add the files back in to the req.body so that they can be treated normally in validation
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
  body("POI.*.description.*", "Invalid data type, must be a string")
    .exists()
    .isString()
    .trim()
    .escape(),
  body("POI.*.files")
    .exists()
    .custom((value, { req }) => {
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

    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array(), {
          controller: "saveTrail",
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
        include: [Trail.TrailCoords],
      });

      // Make Point of Interest array
      // images will be stored at /public/images/<Trail ID>/<POI || Hazard>/
      if (body.POI) {
        for (const point of body.POI) {
          // const link = getImageLinks(trail.trailId, point.files, "POI");
          point.trailId = trail.trailId;
          point.image = await getImageLinks(trail.trailId, point.files, "POI");
        }

        console.log("body.POI: ", body.POI);
      }

      // ensure new trail returns an array (if only 1 item is returned)
      let trailArr = [];
      if (Array.isArray(trail)) {
        trailArr = trail;
      } else {
        trailArr = [trail];
      }

      logger.debug(JSON.stringify(trailArr), {
        controller: "saveTrail",
        msg: "return data",
      });

      // send the new trail back to the client
      // res.status(201).json(body.POI);
      res.status(201).json(trailArr);
      return;
    } catch (err) {
      logger.debug(err, {
        controller: "saveTrail",
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err.message });
      return;
    }
  },
];

/**
 * Takes in a trailId, file (from req.files) and a type, either POI or Hazard to define where the image will be stored. Images will be stored in:
 *
 *    ./public/images/<trailId>/<POI | Hazard>/
 *
 * @param {number} trailId
 * @param {fileObject} file
 * @param {"POI" | "Hazard"} type
 * @returns The link to the files storage location
 */
async function getImageLinks(trailId, file, type) {
  try {
    // ensure filesystem exists for save
    const path = SAVE_DIRECTORY + trailId + "/POI/";
    console.log("getImageLinks: path", path);

    await ensureDirExists(path);

    const { buffer, originalname } = file;
    const { fileName } = getFileName(originalname);
    const link = `${path}${fileName}.webp`;

    await sharp(buffer)
      .resize(RESIZE)
      .webp({ quality })
      .toFile(link)
      .catch((err) => {
        console.log(err);
        logger.debug(err, {
          controller: "getImageLinks",
          errorMsg: "getImageLinks Sharp Error writing file",
        });
        throw new Error(err);
      });

    console.log("getImageLinks: link", link);
    return link;
  } catch (err) {
    console.log(err);
    logger.debug(err, {
      controller: "getImageLinks",
      errorMsg: "catch error",
    });
  }
}
