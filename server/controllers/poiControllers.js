const { body } = require("express-validator");

/**
 * Adds a point of interest to the DB
 *
 * This will be from a multipart form (because of the image).
 * The following fields are required:
 * description {string}
 * image {buffer object from multer}
 * isActive (boolean)
 * latitude (float)
 * longitude (float)
 *
 * The following fields are optional:
 * accuracy {float}
 * altitude {float}
 * altitudeAccuracy {float}
 * heading {float}
 * speed {float}
 */
exports.addPOI = [
  // Points of Interest validation
  body().custom((value, { req }) => {
    // Add the files back in to the req.body so that they can be treated normally in validation
    const files = req.files.image;
    if (files) {
      value.files = files;
    }
    return true;
  }),
  body("description.*", "Invalid data type, must be a string")
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
  body(
    ["accuracy", "altitude", "altitudeAccuracy", "heading", "speed"],
    "Invalid data type, must be a float (#.#)"
  )
    .optional()
    .isFloat()
    .toFloat(),

  // main function
  async (req, res) => {
    // save POI to DB
  },
];
