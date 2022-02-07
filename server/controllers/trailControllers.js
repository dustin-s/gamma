const { body, validationResult } = require("express-validator");
const { errorMsg, informationMsg } = require("../utils/formatting");

const { Trail, TrailCoords } = require("../models");
const { distance } = require("../utils/distance");

// returns a list of all of the trails and the trail's points
exports.listTrails = async (req, res) => {
  try {
    trails = await Trail.findAll({
      include: TrailPoints,
    });
    res.status(200).json(trails);
  } catch (er) {
    console.log(errorMsg("listTrails Catch Error:\n"), err);
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
  body("coords", "The trail must have at least 2 points.").exists().isArray({
    min: 2,
  }),
  body("coords.*.latitude").exists().toFloat(),
  body("coords.*.longitude").exists().toFloat(),
  body("coords.*.accuracy").optional().toFloat(),
  body("coords.*.altitude").optional().toFloat(),
  body("coords.*.altitudeAccuracy").optional().toFloat(),
  body("coords.*.heading").optional().toFloat(),
  body("coords.*.speed").optional().toFloat(),

  // Points of Interest validation

  async (req, res) => {
    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
      }

      const newTrail = {
        name: req.body.name,
        difficulty: req.body.difficulty,
      };
      if (req.body.description) newTrail.description = req.body.description;
      if (req.body.isClosed) newTrail.isClosed = req.body.isClosed;

      // clean coords? remove duplicates... check for backtracking?

      const coords = req.body.coords;

      let dist = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];

        dist += distance(a.latitude, a.longitude, b.latitude, b.longitude);
      }
      // let dist = coords.reduce((a, b) => {
      //   console.log("\na:", a, "\nb:", b);
      //   distance(a.latitude, a.longitude, b.latitude, b.longitude);
      // });
      newTrail.distance = dist;

      console.log(
        informationMsg("\nnewTrail:\n"),
        informationMsg(JSON.stringify(newTrail)),
        informationMsg("\n\ncoords:\n"),
        informationMsg(JSON.stringify(req.body.coords)),
        informationMsg("\n\ndistance:"),
        informationMsg(dist),
        "\n"
      );

      const trail = await Trail.create(newTrail);

      res.status(201).json(trail);
    } catch (err) {
      console.log(errorMsg("saveTrail Catch Error:\n"), err);
      res.status(500).json(err);
    }
  },
];
