const { body, validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const { PointsOfInterest, Trail } = require("../models");
const { validationErrors } = require("../utils/helpers");
const { getImageLinks, removeImage } = require("../utils/images");

/**
 * Adds a point of interest to the DB
 *
 * This will be from a multipart form (because of the image).
 * The following fields are required:
 *    trailId {int}
 *    description {string}
 *    image {buffer object from multer (req.files)}
 *    isActive (boolean)
 *    latitude (float)
 *    longitude (float)
 *
 * The following fields are optional:
 *    accuracy {float}
 *    altitude {float}
 *    altitudeAccuracy {float}
 *    heading {float}
 *    speed {float}
 */
exports.addPOI = [
  // Points of Interest validation
  body().custom((value, { req }) => {
    // Add the files back in to the req.body so that they can be treated normally in validation
    const files = req.files.image;
    if (files) {
      value.files = files[0];
    }
    return true;
  }),
  // required fields
  body("trailId").exists().isInt().toInt(),
  body("description", "Invalid data type, must be a string")
    .exists()
    .isString()
    .trim()
    .escape(),
  body("files")
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
  body("isActive", "Point of Interest isActive must be true/false")
    .exists()
    .isBoolean()
    .toBoolean(),
  body(["latitude", "longitude"], "Invalid data type, must be a float (#.#)")
    .exists()
    .isFloat()
    .toFloat(),
  // optional fields
  body(
    ["accuracy", "altitude", "altitudeAccuracy", "heading", "speed"],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // main function
  async (req, res) => {
    // console.log("req.body", req.body);
    const controller = "addPOI";

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error(errors.array(), {
          controller,
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
        return;
      }
      // make POI to save
      const body = req.body;
      body.image = await getImageLinks(body.trailId, body.files, "POI");

      // save POI to DB
      const poi = await PointsOfInterest.create(body);
      if (!poi) {
        throw new Error("No points of interest created.");
      }

      res.status(201).json({ poi });
      return;
    } catch (err) {
      logger.error(err, {
        controller,
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err.message });
      return;
    }
  },
];

/**
 * Change an existing point of interest in the DB
 *
 * This will be from a multipart form (because of the image).
 * The following fields are required - and con not be changed:
 *    pointsOfInterestId (int)
 *    trailId {int}
 *
 * The following fields are optional:
 *    description {string}
 *    image {buffer object from multer (req.files)}
 *    isActive (boolean)
 *
 *    latitude (float)
 *    longitude (float)
 *    accuracy {float}
 *    altitude {float}
 *    altitudeAccuracy {float}
 *    heading {float}
 *    speed {float}
 */
exports.updatePOI = [
  // Points of Interest validation
  body().custom((value, { req }) => {
    console.log("\n***** Update Points Of Interest Validation ******\n");
    // Add the files back in to the req.body so that they can be treated normally in validation
    const files = req.files.image;
    if (files) {
      value.files = files[0];
    }
    return true;
  }),
  // required fields
  body("pointsOfInterestId")
    .exists()
    .isInt()
    .toInt()
    .bail()
    .custom(async (value) => {
      const poi = await PointsOfInterest.findByPk(value);
      console.log("***** Check if POI exists");
      if (!poi) {
        console.log("****** POI doesn't exists");
        throw new Error("pointsOfInterestId doesn't exist");
      }
      console.log("****** POI exists");
      return true;
    }),
  // optional fields
  body("trailId")
    .exists()
    .isInt()
    .toInt()
    .bail()
    .custom(async (value) => {
      console.log("***** Check if trail exists");
      const trail = await Trail.findByPk(value);
      if (!trail) {
        console.log("****** trail doesn't exists");
        throw new Error("trailId doesn't exist");
      }
      console.log("****** trail exists");
      return true;
    }),
  body("description", "Invalid data type, must be a string")
    .optional()
    .isString()
    .trim()
    .escape(),
  body("files")
    .optional()
    .custom((value) => {
      // check valid mime types
      const mimetypeArr = value.mimetype.split("/");

      return (
        mimetypeArr[0] === "image" &&
        VALID_IMAGE_TYPES.indexOf(mimetypeArr[1]) > -1
      );
    })
    .withMessage(`Files must be of type: .${VALID_IMAGE_TYPES.join(", .")}`),
  body("isActive", "Point of Interest isActive must be true/false")
    .optional()
    .isBoolean()
    .toBoolean(),
  body(
    [
      "latitude",
      "longitude",
      "accuracy",
      "altitude",
      "altitudeAccuracy",
      "heading",
      "speed",
    ],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // main function
  async (req, res) => {
    console.log("\n***** Update Points Of Interest Function ******\n");
    const controller = "updatePOI";
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error(errors.array(), {
          controller,
          errorMsg: "validation error",
        });
        // res.status(400).json({ error: validationErrors(errors.array()) });
        res.status(400).json({ error: errors.array() });
        return;
      }

      const newPOI = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (key !== "pointsOfInterestId" || key !== "trailId") {
          newPOI[key] = value;
        }
      }

      const poi = await PointsOfInterest.findByPk(req.body.pointsOfInterestId);
      if (!poi) {
        throw new Error("Point of Interest not found");
      }

      // deal with image
      console.log("POI:\n", poi.toJSON());
      console.log("newPOI:\n", newPOI);
      // - if new image - create new link, delete old image
      if (newPOI.files) {
        console.log("update image");
        newPOI.image = await getImageLinks(poi.trailId, newPOI.files, "POI");
        if (newPOI.image !== poi.image) {
          console.log("remove old image");
          removeImage(poi.image);
        }
      }

      poi.update(newPOI);

      res.status(200).json(poi);
    } catch (err) {
      console.log(err);
      logger.error(err, {
        controller,
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err.message });
      return;
    }
  },
];
