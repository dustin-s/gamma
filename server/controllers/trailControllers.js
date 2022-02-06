const { body, validationResult } = require("express-validator");

const { Trail, TrailCoords } = require("../models");

// returns a list of all of the trails and the trail's points
exports.listTrails = async (req, res) => {
  try {
    trails = await Trail.findAll({
      include: TrailPoints,
    });
    res.status(200).json(trails);
  } catch (er) {
    console.log("listTrails Catch Error:\n", err);
    res.status(500).json(err);
  }
};

exports.saveTrail = [
  // Trail validation
  body("name")
    .trim()
    .custom(async (value) => {
      const trail = await Trail.findAll({ where: { name: value } });
      if (trail.length > 0) {
        throw new Error(`Trail name, "${value}", is already in use`);
      }
    }),
  body("description").trim().escape().optional(),
  body("difficulty", "Invalid selection for difficulty").isIn([
    "easy",
    "moderate",
    "hard",
  ]),
  body("isClosed", "isClosed must be true/false").isBoolean().optional(),

  // Trail Points validation
  body("coords.*", "The trail must have at least 2 points.").isArray({
    min: 2,
  }),
  body("coords.*.latitude").exists(),
  body("coords.*.longitude").exists(),

  async (req, res) => {
    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
      }

      const newData = req.body;

      const trail = await Trail.create(newData);

      res.status(201).json(trail);
    } catch (err) {
      console.log("saveTrail Catch Error:\n", err);
      res.status(500).json(err);
    }
  },
];
