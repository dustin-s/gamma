const { body, validationResult } = require("express-validator");
const sharp = require("sharp");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const {
  SAVE_DIRECTORY,
  QUALITY: quality,
  RESIZE,
} = require("../config/imageUpload");
const { distance } = require("../utils/distance");
const { ensureDirExists, getFileName } = require("../utils/fileHelpers");

const { Trail, TrailCoords, User } = require("../models");
const {
  validationErrors,
  checkLengthOfObjectArrays,
  arrayLength,
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
      // .isArray({ min:2 }
      return (
        arrayLength(value.TrailCoords_latitude) >= 2 &&
        arrayLength(value.TrailCoords_longitude) >= 2
      );
    })
    .withMessage("There must be at least 2 points on the trail")
    .custom((value) => {
      return checkLengthOfObjectArrays(value, "TrailCoords");
    })
    .withMessage("TrailCoords arrays must be the same length"),
  body(
    ["TrailCoords_latitude.*", "TrailCoords_longitude.*"],
    "Invalid data type, must be a float (#.#)"
  )
    .exists()
    .isFloat()
    .toFloat(),
  body(
    [
      "TrailCoords_accuracy.*",
      "TrailCoords_altitude.*",
      "TrailCoords_altitudeAccuracy.*",
      "TrailCoords_heading.*",
      "TrailCoords_speed.*",
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
      console.log("*****************************\n"); //, req.files);

      // an array to keep track of errors that occur here
      const errors = [];

      const required = [
        "POI_image",
        "POI_description",
        "POI_isActive",
        "POI_latitude",
        "POI_longitude",
      ];
      const optional = [
        "POI_accuracy",
        "POI_altitude",
        "POI_altitudeAccuracy",
        "POI_heading",
        "POI_speed",
      ];
      const both = required.concat(optional);

      // check if this is an array. If so, make sure all other required fields (including Files[]) are also arrays and that their lengths are the same. If not, ensure Files[].length=1.
      const details = [];

      // check the fields for existence and length. If an optional does not exist, it isn't added to the details array
      both.forEach((key) => {
        if (value[key] || req.files[key]) {
          let len;

          if (key === "POI_image") {
            len = Array.isArray(req.files[key]) ? req.files[key].length : 1;
          } else {
            len = Array.isArray(value[key]) ? value[key].length : 1;
          }

          details.push({
            key,
            exists: true,
            len,
          });
          console.log(details[details.length - 1]);
        } else {
          if (!optional.find((item) => item === key)) {
            details.push({
              key,
              exists: false,
              len: 0,
            });
            console.log(details[details.length - 1]);
          }
        }
      });

      // first check if the arrays are all the same size
      const maxLen = details.reduce(
        (previous, { len }) => Math.max(previous, len),
        details[0].len
      );

      if (!details.every((val) => val.len === maxLen)) {
        errors.push("POI arrays must be the same length");
      }

      // if no fields exist, then exit
      if (maxLen === 0) {
        return true;
      }

      // create an array of missing required fields
      const checkExist = [];
      details.map(({ exists, key }) => {
        if (!exists) return checkExist.push(key);
      });

      if (checkExist.length !== 0) {
        errors.push(`Missing required POI fields: ${checkExist.join(", ")}`);
      }

      if (errors.length) {
        throw new Error(errors.join("\n"));
      }

      return true;
    })
    .custom((value, { req }) => {
      // check valid mime types
      const errors = [];

      console.log("POI_image", req.files.POI_image ? true : false);

      return true;
    }),
  body("POI_description.*", "Invalid data type, must be a string")
    .exists()
    .isString()
    .trim()
    .escape(),
  // check("POI_image.*")
  //   .exists()
  //   .custom((value, { req }) => {
  //     // check valid mime types
  //     console.log("POI_Image.* value:", value);
  //     console.log("POI_Image.* req:", req.files);
  //   }),
  body("POI_isActive.*", "Point of Interest isActive must be true/false")
    .optional()
    .isBoolean()
    .toBoolean(),
  body(
    ["POI_latitude.*", "POI_longitude.*"],
    "Invalid data type, must be a float (#.#)"
  )
    .exists()
    .isFloat()
    .toFloat(),
  body(
    [
      "POI_accuracy.*",
      "POI_altitude.*",
      "POI_altitudeAccuracy.*",
      "POI_heading.*",
      "POI_speed.*",
    ],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // Finally, the actual function!
  async (req, res) => {
    console.log("req.body:", req.body);

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
      };

      // make TrailCoords array for newTrail
      newTrail.TrailCoords = [];
      for (let i = 0; i < body.TrailCoords_latitude.length; i++) {
        const location = {
          latitude: body.TrailCoords_latitude[i],
          longitude: body.TrailCoords_longitude[i],
        };

        if (body.TrailCoords_accuracy)
          location.accuracy = body.TrailCoords_accuracy[i];
        if (body.TrailCoords_altitude)
          location.altitude = body.TrailCoords_altitude[i];
        if (body.TrailCoords_altitudeAccuracy)
          location.altitudeAccuracy = body.TrailCoords_altitudeAccuracy[i];
        if (body.TrailCoords_heading)
          location.heading = body.TrailCoords_heading[i];
        if (body.TrailCoords_speed) location.speed = body.TrailCoords_speed[i];

        newTrail.TrailCoords.push(location);
      }

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
      // images will be stored at /public/images/<Trail ID>/<POI || Hazard>/<index #>jpg
      console.log("trailID:", trail.trailId);

      // due to validation we can assume that if descriptions is an array, then all of the POI properties are an array.
      const PointsOfInterest = [];

      console.log("body.POI_description.length:", body.POI_description.length);
      console.log(
        "Array.isArray(body.POI_description):",
        Array.isArray(body.POI_description)
      );

      if (!Array.isArray(body.POI_description)) {
        const poiObj = await makePointOfInterest(
          trail.trailId,
          body.POI_description,
          req.files.POI_image[0],
          body.POI_isActive,
          body.POI_latitude,
          body.POI_longitude,
          body.POI_accuracy,
          body.POI_altitude,
          body.POI_altitudeAccuracy,
          body.POI_heading,
          body.POI_speed
        );
        PointsOfInterest.push(poiObj);
      } else {
        console.log("POI: Else");
        for (let i = 0; i < body.POI_description.length; i++) {
          const poiObj = await makePointOfInterest(
            trail.trailId,
            body.POI_description[i],
            req.files.POI_image[i],
            body.POI_isActive[i],
            body.POI_latitude[i],
            body.POI_longitude[i],
            body.POI_accuracy ? body.POI_accuracy[i] : undefined,
            body.POI_altitude ? body.POI_altitude[i] : undefined,
            body.POI_altitudeAccuracy
              ? body.POI_altitudeAccuracy[i]
              : undefined,
            body.POI_heading ? body.POI_heading[i] : undefined,
            body.POI_speed ? body.POI_speed[i] : undefined
          );
          PointsOfInterest.push(poiObj);
        }
      }

      console.log("POI: ", PointsOfInterest);

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
      res.status(201).json(trailArr);
      // res.status(200).json({ message: "success - Save is commented out" });
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

// image is the record from req.files (object)
async function makePointOfInterest(
  trailId,
  description,
  image,
  isActive,
  latitude,
  longitude,
  accuracy,
  altitude,
  altitudeAccuracy,
  heading,
  speed
) {
  try {
    // ensure filesystem exists for save
    const path = SAVE_DIRECTORY + trailId + "/POI/";
    console.log("makePointOfInterest: path", path);

    await ensureDirExists(path);

    const { buffer, originalname } = image;
    const { fileName } = getFileName(originalname);
    const link = `${path}${fileName}.webp`;

    await sharp(buffer)
      .resize(RESIZE)
      .webp({ quality })
      .toFile(link)
      .catch((err) => {
        console.log(err);
        logger.debug(err, {
          controller: "makePointOfInterest",
          errorMsg: "makePointOfInterest Sharp Error writing file",
        });
        throw new Error(err);
      });

    const poiObj = {
      trailId,
      description,
      image: link,
      isActive,
      latitude,
      longitude,
    };

    if (accuracy) {
      poiObj.accuracy = accuracy;
    }
    if (altitude) {
      poiObj.altitude = altitude;
    }
    if (altitudeAccuracy) {
      poiObj.altitudeAccuracy = altitudeAccuracy;
    }
    if (heading) {
      poiObj.heading = heading;
    }
    if (speed) {
      poiObj.speed = speed;
    }

    return poiObj;
  } catch (err) {
    console.log(err);
  }
}
