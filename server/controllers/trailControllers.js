const { body, validationResult } = require("express-validator");

const { Trail } = require("../models");

exports.listTrails = (req, res) => {
  res.status(200).json({ trails: "trails" });
};
