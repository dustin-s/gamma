const { body } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const { PointsOfInterest, Trail } = require("../models");

exports.addPOIValidator = [
  body().custom((value, { req }) => {
    logger.debug("raw body: " + JSON.stringify(req.body, null, 2), {
      controller: "addPOIValidator",
      errorMsg: "body.custom",
    });
    const files = req.files.image;
    if (files) {
      value.files = files[0];
    }
    return true;
  }),
  // required fields
  body("trailId", "Invalid data type, must be an integer")
    .isInt()
    .bail()
    .toInt()
    .custom(async (value) => {
      const trail = await Trail.findByPk(value);
      if (!trail) {
        throw new Error("Trail ID doesn't exist");
      }
    }),
  body("description", "Invalid data type, must be a string")
    .exists()
    .isString()
    .trim(),
  body("files")
    .exists()
    .custom((value) => {
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
];

exports.updatePOIValidator = [
  body().custom((value, { req }) => {
    logger.debug("raw body: " + JSON.stringify(req.body, null, 2), {
      controller: "updatePOIValidator",
      errorMsg: "body.custom",
    });
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
      if (!poi) {
        throw new Error("pointsOfInterestId doesn't exist");
      }
      return true;
    }),
  // optional fields
  body("description", "Invalid data type, must be a string")
    .optional()
    .isString()
    .trim(),
  body("files")
    .optional()
    .custom((value) => {
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
];
