const { body } = require("express-validator");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");

exports.addPOIValidator = [
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
];
