const { body, validationResult } = require("express-validator");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { Trail, TrailCoords, User } = require("../models");
const { distance } = require("../utils/distance");

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
  body("name")
    .optional()
    .trim()
    .custom(async (value) => {
      const trail = await Trail.findAll({ where: { name: value } });
      if (trail.length > 0) {
        throw new Error(`Trail name, ${value}, is already in use`);
      }
    }),
  body("description").trim().escape().optional(),
  body("difficulty", "Invalid selection for difficulty")
    .exists()
    .withMessage("Difficulty field is required")
    .bail()
    .trim()
    .isIn(["easy", "moderate", "hard"]),
  body("isClosed", "isClosed must be true/false").toBoolean().optional(),

  // Trail Points validation
  body().custom((value, { req }) => {
    // use latitude array to make sure that there are at least 2 points on the trail (.isArray({ min:2 }))
    console.log(
      "Array.isArray(req.body.TrailCoords_latitude) ",
      !Array.isArray(req.body.TrailCoords_latitude)
    );
    console.log(
      "req.body.TrailCoords_latitude.length ",
      req.body.TrailCoords_latitude.length
    );
    if (
      !Array.isArray(req.body.TrailCoords_latitude) ||
      req.body.TrailCoords_latitude.length < 2
    ) {
      throw new Error("There must be at least 2 points on the trail");
    }

    // check if the all of the arrays are the same length. Only Lat and Long are required, so only check the others if they exist. Put all of the lengths that exist into an array and then make sure every item in the array matches (the first).
    const lengths = [
      req.body.TrailCoords_latitude.length,
      req.body.TrailCoords_longitude.length,
    ];

    if (req.body.TrailCoords_accuracy)
      lengths.push(req.body.TrailCoords_accuracy);
    if (req.body.TrailCoords_altitude)
      lengths.push(req.body.TrailCoords_altitude);
    if (req.body.TrailCoords_altitudeAccuracy)
      lengths.push(req.body.TrailCoords_altitudeAccuracy);
    if (req.body.TrailCoords_heading)
      lengths.push(req.body.TrailCoords_heading);
    if (req.body.TrailCoords_speed) lengths.push(req.body.TrailCoords_speed);

    if (!lengths.every((val) => val === lengths[0])) {
      throw new Error("TrailCoords arrays must be the same length");
    }
    return value;
  }),
  body("TrailCoords_latitude.*").exists().toFloat(),
  body("TrailCoords_longitude.*").exists().toFloat(),
  body("TrailCoords_accuracy.*").optional().toFloat(),
  body("TrailCoords_altitude.*").optional().toFloat(),
  body("TrailCoords_altitudeAccuracy.*").optional().toFloat(),
  body("TrailCoords_heading.*").optional().toFloat(),
  body("TrailCoords_speed.*").optional().toFloat(),

  // Points of Interest validation

  async (req, res) => {
    console.log("TrailCoords[]:", req.body);

    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array(), {
          controller: "saveTrail",
          errorMsg: "validation error",
        });
        res.status(400).json({ error: errors.array() });
        return;
      }

      const newTrail = req.body;

      newTrail.TrailCoords = [];

      for (let i = 0; i < newTrail.TrailCoords_latitude.length; i++) {
        const location = {
          latitude: newTrail.TrailCoords_latitude[i],
          longitude: newTrail.TrailCoords_longitude[i],
        };

        if (newTrail.TrailCoords_accuracy)
          location.accuracy = newTrail.TrailCoords_accuracy[i];
        if (newTrail.TrailCoords_altitude)
          location.altitude = newTrail.TrailCoords_altitude[i];
        if (newTrail.TrailCoords_altitudeAccuracy)
          location.altitudeAccuracy = newTrail.TrailCoords_altitudeAccuracy[i];
        if (newTrail.TrailCoords_heading)
          location.heading = newTrail.TrailCoords_heading[i];
        if (newTrail.TrailCoords_speed)
          location.speed = newTrail.TrailCoords_speed[i];

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

      const trail = await Trail.create(newTrail, {
        include: [Trail.TrailCoords],
      });

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

      res.status(201).json(trailArr);
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
