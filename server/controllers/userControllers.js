const { body, validationResult } = require("express-validator");
const { User } = require("../models");

exports.newUser = async function (req, res, next) {
  try {
    const newData = req.body;
    newData.lastLogin = new Date();

    const newUser = await User.create(newData);

    delete newUser.dataValues.password; //delete field password

    // **********************************************************************
    // ToDo: Deal with session (JWT/Session/OAuth)
    // **********************************************************************

    res.status(201).json(newUser);
  } catch (err) {
    const { message } = err;
    if (message === "Validation error") {
      res.status(400).json(err);
    }
    console.log("Sign Up Catch Error:\n", err);
    res.status(500).json(err);
  }
};
