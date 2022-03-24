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

exports.saveTrail = [
  // Trail validation
  body("createdBy", "Invalid data type, must be an integer")
    .isInt()
    .bail()
    .toInt()
    .custom(async (value) => {
      logger.debug(value, {
        controller: "saveTrail validation",
        msg: "createdBy id",
      });
      const user = await User.findByPk(value);
      logger.debug(JSON.stringify(user), {
        controller: "saveTrail validation",
        msg: "createdBy info",
      });
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
  body("TrailCoords", "The trail must have at least 2 points.")
    .exists()
    .isArray({
      min: 2,
    }),
  body("TrailCoords.*.latitude").exists().toFloat(),
  body("TrailCoords.*.longitude").exists().toFloat(),
  body("TrailCoords.*.accuracy").optional().toFloat(),
  body("TrailCoords.*.altitude").optional().toFloat(),
  body("TrailCoords.*.altitudeAccuracy").optional().toFloat(),
  body("TrailCoords.*.heading").optional().toFloat(),
  body("TrailCoords.*.speed").optional().toFloat(),

  // Points of Interest validation

  async (req, res) => {
    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array(), {
          controller: "saveTrail",
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
      }

      const newTrail = req.body;

      // clean coords? remove duplicates... check for backtracking?

      let dist = 0;
      for (let i = 0; i < newTrail.TrailCoords.length - 1; i++) {
        const a = newTrail.TrailCoords[i];
        const b = newTrail.TrailCoords[i + 1];

        dist += distance(a.latitude, a.longitude, b.latitude, b.longitude);
      }

      newTrail.distance = dist;

      // console.log(informationMsg("\nnewTrail:\n"), newTrail, informationMsg("\n\ndistance:"), dist, "\n");

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
    } catch (err) {
      logger.debug(err, {
        controller: "saveTrail",
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err });
    }
  },
];
