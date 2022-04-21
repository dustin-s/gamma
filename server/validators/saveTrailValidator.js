const { body } = require("express-validator");

const { Trail, User } = require("../models");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const {
  checkLengthOfObjectArrays,
  makeObjectArray,
} = require("../utils/helpers");

exports.saveTrailValidator = [
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
];
