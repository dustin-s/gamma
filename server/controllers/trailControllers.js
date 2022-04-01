const { body, validationResult, check, param } = require("express-validator");

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
    return true;
  }),
  body("TrailCoords_latitude.*").exists().toFloat(),
  body("TrailCoords_longitude.*").exists().toFloat(),
  body("TrailCoords_accuracy.*").optional().toFloat(),
  body("TrailCoords_altitude.*").optional().toFloat(),
  body("TrailCoords_altitudeAccuracy.*").optional().toFloat(),
  body("TrailCoords_heading.*").optional().toFloat(),
  body("TrailCoords_speed.*").optional().toFloat(),

  // Points of Interest validation
  // POI is optional, however if 1 item exists, they all must exist and an image is required for each item. (use express-validator.check so I have access to req.files and not just req.body) All existence error checking is done here. Type checking and sanitization will be done later.
  body().custom((value, { req }) => {
    console.log("*****************************\n");
    // an array to keep track of errors that occur here
    const errors = [];

    const required = [
      "POI_Image",
      "POI_description",
      "POI_isActive",
      "POI_latitude",
      "POI_longitude",
    ];
    const optional = [
      "POI_accuracy",
      "POI_altitude",
      "POI_altitudeAccuracy",
      "POI_heading",
      "POI_speed",
    ];
    const both = required.concat(optional);

    // check if this is an array. If so, make sure all other required fields (including Files[]) are also arrays and that their lengths are the same. If not, ensure Files[].length=1.
    const details = [];

    // check the fields for existence and length. If an optional does not exist, it isn't added to the details array
    both.forEach((key) => {
      if (req.body[key] || req.files[key]) {
        let len;
        if (key === "POI_Image") {
          len = Array.isArray(req.files[key]) ? req.files[key].length : 1;
        } else {
          len = Array.isArray(req.body[key]) ? req.body[key].length : 1;
        }

        details.push({
          key,
          exists: true,
          len,
        });
      } else {
        if (!optional.find((item) => item === key)) {
          details.push({
            key,
            exists: false,
            len: 0,
          });
        }
      }
    });

    // first check if the arrays are all the same size
    const maxLen = details.reduce(
      (previous, { len }) => Math.max(previous, len),
      details[0].len
    );

    if (!details.every((val) => val.len === maxLen)) {
      errors.push("POI arrays must be the same length");
    }

    // if no fields exist, then exit
    if (maxLen === 0) {
      return true;
    }

    // create an array of missing required fields
    const checkExist = [];
    details.map(({ exists, key }) => {
      if (!exists) return checkExist.push(key);
    });

    if (checkExist.length !== 0) {
      errors.push(`Missing required POI fields: ${checkExist.join(", ")}`);
    }

    console.log("errors.length:", errors.length);
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    return true;
  }),
  body("POI_description.*").exists().trim().escape(),
  body("POI_Image.*").exists(),
  body("POI_isActive.*", "Point of Interest isActive must be true/false")
    .toBoolean()
    .optional(),
  body("POI_latitude.*").exists().toFloat(),
  body("POI_longitude.*").exists().toFloat(),
  body("POI_accuracy.*").optional().toFloat(),
  body("POI_altitude.*").optional().toFloat(),
  body("POI_altitudeAccuracy.*").optional().toFloat(),
  body("POI_heading.*").optional().toFloat(),
  body("POI_speed.*").optional().toFloat(),

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

      const body = req.body;

      const newTrail = {
        name: body.name,
        description: body.description,
        difficulty: body.difficulty,
        isClosed: body.isClosed,
        createdBy: body.userId,
      };

      // make TrailCoords array for newTrail
      // newTrail.TrailCoords = [];
      // for (let i = 0; i < body.TrailCoords_latitude.length; i++) {
      //   const location = {
      //     latitude: body.TrailCoords_latitude[i],
      //     longitude: body.TrailCoords_longitude[i],
      //   };

      //   if (body.TrailCoords_accuracy)
      //     location.accuracy = body.TrailCoords_accuracy[i];
      //   if (body.TrailCoords_altitude)
      //     location.altitude = body.TrailCoords_altitude[i];
      //   if (body.TrailCoords_altitudeAccuracy)
      //     location.altitudeAccuracy = body.TrailCoords_altitudeAccuracy[i];
      //   if (body.TrailCoords_heading)
      //     location.heading = body.TrailCoords_heading[i];
      //   if (body.TrailCoords_speed) location.speed = body.TrailCoords_speed[i];

      //   newTrail.TrailCoords.push(location);
      // }

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
        include: [Trail.TrailCoords],
      });

      // ensure new trail returns an array (if only 1 item is returned)
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

      // send the new trail back to the client
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
