const { body, validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { VALID_IMAGE_TYPES } = require("../config/imageUpload");
const { PointsOfInterest } = require("../models");
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
exports.addPOI = async (req, res, next) => {
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

    next();
  } catch (err) {
    logger.error(err, {
      controller,
      errorMsg: "catch error",
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * Change an existing point of interest in the DB
 *
 * This will be from a multipart form (because of the image).
 * The following fields are required - and con not be changed:
 *    pointsOfInterestId (int)
 *
 * The following fields are optional:
 *    description {string}
 *    image {buffer object from multer (req.files)}
 *    isActive (boolean)
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

  // main function
  async (req, res) => {
    const editableFields = ["description", "image", "isActive"];
    const controller = "updatePOI";

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error(errors.array(), {
          controller,
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
        // res.status(400).json({ error: errors.array() });
        return;
      }

      const newPOI = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (editableFields.includes(key)) {
          newPOI[key] = value;
        }
      }

      const poi = await PointsOfInterest.findByPk(req.body.pointsOfInterestId);
      if (!poi) {
        throw new Error("Point of Interest not found");
      }

      // deal with image - if new image - create new link, delete old image
      if (req.body.files) {
        newPOI.image = await getImageLinks(poi.trailId, req.body.files, "POI");
        if (newPOI.image !== poi.image) {
          removeImage(poi.image);
        }
      }

      // console.log("newPOI:\n", newPOI);
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
