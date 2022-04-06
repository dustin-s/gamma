const { body, validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const { PointsOfInterest } = require("../models");
const { validationErrors } = require("../utils/helpers");
const { getImageLinks } = require("../utils/images");

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
 * The following fields are required:
 *    pointsOfInterestId (int)
 *
 * The following fields are optional:
 *    trailId {int}
 *    description {string}
 *    image {buffer object from multer (req.files)}
 *    isActive (boolean)
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
    // Add the files back in to the req.body so that they can be treated normally in validation
    const files = req.files.image;
    if (files) {
      value.files = files[0];
    }
    return true;
  }),
  // required fields
  body("pointsOfInterestId").exists().isInt().toInt(),
  // optional fields
  body("trailId")
    .optional()
    .isInt()
    .toInt()
    .bail()
    .custom(async (value) => {
      const trail = await Trail.findByPk(value);
      if (!trail) {
        throw new Error("trailId doesn't exist");
      }
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

      const body = req.body;
      const poi = await PointsOfInterest.findByPk(body.pointsOfInterestId);

      res.status(200).json(req.body);
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
