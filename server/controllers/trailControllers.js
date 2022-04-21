const { validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { Trail, TrailCoords, PointsOfInterest } = require("../models");

const { distance } = require("../utils/distance");
const { getImageLinks } = require("../utils/images");

// returns a list of all of the trails and the trail's points
exports.listTrails = async (req, res, next) => {
  const controller = "listTrails";
  try {
    trails = await Trail.findAll({ include: [TrailCoords, PointsOfInterest] });
    res.status(200).json(trails);
  } catch (err) {
    logger.debug(err, {
      controller,
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
    logger.debug(err, {
      controller,
      errorMsg: "catch error",
    });
    res.status(500).json({ error: err.message });
    return;
  }
};
