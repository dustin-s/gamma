const { validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { Trail, TrailCoords, PointsOfInterest } = require("../models");

const { distance } = require("../utils/distance");
const { validationErrors } = require("../utils/helpers");
const { getImageLinks } = require("../utils/images");

/**
 * returns a list of all of the trails (open and closed), the trail's points, and if they exist, the active points of interest and hazards
 */
exports.listTrails = async (req, res, next) => {
  const controller = "listTrails";
  try {
    trails = await Trail.findAll({
      include: [TrailCoords, PointsOfInterest],
    });
    res.status(200).json(trails);
  } catch (err) {
    logger.debug(err, {
      controller,
      errorMsg: "listTrails Catch Error",
    });
    res.status(500).json(err);
  }
};

/**
 * Adds a trail to the DB
 *
 * This will be from a multipart form (because of the potential image).
 * The following fields are required:
 *    createdBy {int}
 *    difficulty {"easy", "moderate", "hard"}
 *
 *    At least 2 TrailCoords which require:
 *      TrailCoords.latitude (float)
 *      TrailCoords.longitude (float)
 *
 *    If a POI array exists it requires
 *      POI.description {string}
 *      POI.image {buffer object from multer (req.files)}
 *      POI.isActive (boolean)
 *      POI.latitude (float)
 *      POI.longitude (float)
 *
 * The following fields are optional for the trail:
 *    name {string}
 *    description {string}
 *    isClosed {boolean}
 *
 * The following fields are optional for the TrailCoords and POIs:
 *    accuracy {float}
 *    altitude {float}
 *    altitudeAccuracy {float}
 *    heading {float}
 *    speed {float}
 *
 */
exports.saveTrail = async (req, res, next) => {
  console.log("************ Main Function ************"); //, req.files);
  console.log("req.body:\n", req.body, "\n****");

  const controller = "saveTrail";

  try {
    // handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      logger.error(errors.array(), {
        controller,
        errorMsg: "validation error",
      });
      res.status(400).json({ error: validationErrors(errors.array()) });
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

    next();
  } catch (err) {
    console.log("\ncatch error:");
    console.log(err);
    logger.debug(err, {
      controller,
      errorMsg: "catch error",
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * This switches whether or not a trail is opened or closed.
 *
 * The req.body should have a JSON format of:
 * {
 *    "userId": "required existing id",
 *    "trailId": "required existing id",
 *    "name": "optional string",
 *    "description": "optional string",
 *    "difficulty": "optional string ("easy", "moderate", "hard")",
 *    "isClosed": "optional boolean"
 *  }
 */
exports.updateTrail = async (req, res, next) => {
  const editableFields = ["name", "description", "difficulty", "isClosed"];
  const controller = "updateTrail";

  try {
    // handle validation errors
    const { userId, trailId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      logger.error(errors.array(), {
        controller,
        errorMsg: "validation error",
      });
      res.status(400).json({ error: validationErrors(errors.array()) });
      return;
    }

    const newTrailData = {
      updatedBy: userId,
    };
    for (const [key, value] of Object.entries(req.body)) {
      if (editableFields.includes(key)) {
        newTrailData[key] = value;
      }
    }

    const trail = await Trail.findByPk(trailId);
    if (!trail) {
      throw new Error(`Trail ID: ${trailId} could not be retrieved`);
    }

    await trail.update(newTrailData);

    console.log("\nupdate trail success\n", trail.toJSON());
    logger.debug(trail.toJSON(), {
      controller,
      errorMsg: "update trail success",
    });
    next();
  } catch (err) {
    console.log("\ncatch error:");
    console.log(err);
    logger.debug(err, {
      controller,
      errorMsg: "catch error",
    });
    res.status(500).json({ error: err.message });
  }
};
