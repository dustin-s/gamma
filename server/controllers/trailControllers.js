const { body, validationResult } = require("express-validator");

const { Trail, TrailPoints } = require("../models");

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
