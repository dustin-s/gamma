const { body, validationResult } = require("express-validator");

const { User } = require("../models");

/**
 * Use this route to create a new user.
 *
 * The req.body should have a JSON format of:
 * {
 *    "userName": "new string value",
 *    "email": "new string (email) value",
 *    "password": "new string value",
 *    "isAdmin": new boolean value
 *  }
 *
 * Note:
 * isActive is assumed to be true.
 */
exports.newUser = [
  // Validate and sanitize fields.
  body("userName", "User name cannot be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("email")
    .isEmail()
    .withMessage("Email must be a properly formatted email address.")
    .custom(async (value) => {
      const user = await User.findAll({ where: { email: value } });
      if (user.length > 0) {
        throw new Error("E-mail already in use");
      }
    })
    .escape(),
  body(
    "password",
    "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
  ).matches(
    /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[~!@#$%^&*()])[\da-zA-Z~!@#$%^&*()]{8,20}$/
  ),
  // no real check on isAdmin, just escaping it so that we can't get an injection
  body("isAdmin").escape(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const newData = req.body;
      newData.lastLogin = new Date();

      if (!errors.isEmpty()) {
        console.log("retun");
        res.status(400).json(errors);
        return;
      }
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
  },
];

/**
 * This is to submit a login. Response will contain the current information on the user.
 *
 * The req.body should have a JSON format of:
 * {
 *    "email": "newValue",
 *    "password": "newValue",
 *  }
 */
exports.login = async function (req, res, next) {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    // check for user found
    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // check if user is inactive
    if (!userData.isActive) {
      res.status(202).json({
        message:
          "This user has been inactivated, please see your administrator",
      });
    }

    // validate password
    const validPwd = await userData.checkPassword(req.body.password);
    if (!validPwd) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // Commit update
    await userData.update({ lastLogin: new Date() });

    // **********************************************************************
    // ToDo: Deal with session (JWT/Session/OAuth)
    // **********************************************************************

    delete userData.dataValues.password; //delete field password

    res.json({ user: userData, message: "You are now logged in!" });
  } catch (err) {
    console.log("Login Catch Error:\n", err);
    res.status(400).json(err);
  }
};

/**
 * Use this route to update any of the user information - including the password.
 * This requires the user's password to change any information (even if it ISN'T the password)
 *
 * The req.body should have a JSON format of (only fields being changed are required
 * in the newData object):
 * {
 *    "userId": value,
 *    "oldPassword": "password",
 *    "newData": {
 *       "userName": "newValue",
 *       "email": "newValue",
 *       "password": "newValue",
 *       "isAdmin": newValue,
 *       "isActive": newValue,
 *       "requestPwdReset": newValue
 *    }
 *  }
 */
exports.updateUser = async function (req, res, next) {
  try {
    const userId = req.body.userId;
    const oldPwd = req.body.oldPassword;
    const newData = req.body.newData;

    const userData = await User.findByPk(userId);

    // check for user found
    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect user ID or password, please try again" });
      return;
    }

    // validate password
    const validPwd = await userData.checkPassword(oldPwd);
    if (!validPwd) {
      res
        .status(400)
        .json({ message: "Incorrect user ID or password, please try again" });
      return;
    }

    // execute update of new data
    await userData.update(newData);

    delete userData.dataValues.password; //delete field password

    res.json({
      user: userData,
      message: "Update Succeeded!",
    });
  } catch (err) {
    console.log("updateUser Catch Error:\n", err);
    res.status(400).json(err);
  }
};
