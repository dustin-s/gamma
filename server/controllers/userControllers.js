const { body, validationResult } = require("express-validator");
const { signToken } = require("../utils/auth");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { User } = require("../models");
const { errorMsg, informationMsg } = require("../utils/formatting");

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
  body("userName").trim().notEmpty().withMessage("User name cannot be empty"),
  body("email")
    .isEmail()
    .withMessage("Email must be a properly formatted email address")
    .custom(async (value) => {
      const user = await User.findAll({ where: { email: value } });
      if (user.length > 0) {
        throw new Error("Email already in use");
      }
    })
    .normalizeEmail(),
  body(
    "password",
    "Password should have one uppercase , one lower case, one special character (~!@#$%^&*()), one digit and be between 8 and 20 characters long"
  ).isStrongPassword(),
  // no real check on isAdmin, just escaping it so that we can't get an injection
  body("isAdmin").toBoolean(),

  // function to do the addition
  async (req, res) => {
    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
        return;
      }

      const newData = req.body;
      newData.lastLogin = new Date();

      const newUser = await User.create(newData);

      delete newUser.dataValues.password; //delete field password for return data

      const token = signToken({ email: newUser.email, userId: newUser.userId });

      res.status(201).json({ newUser, token });
    } catch (err) {
      const { message } = err;
      if (message === "Validation error") {
        res.status(400).json(err);
      }
      logger.debug("Sign Up Catch Error:\n" + err);
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
exports.login = [
  // Validate and sanitize fields.
  body("email", "Email can't be blank").trim().notEmpty().normalizeEmail(),
  // no validation check on password... this will happen within the function
  body("password", "Password can't be blank").trim().notEmpty().escape(),

  // function to log user in
  async (req, res) => {
    try {
      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug("validation errors:\n" + JSON.stringify(errors.array()));
        res.status(400).json(errors.array());
        return;
      }

      const userData = await User.findOne({ where: { email: req.body.email } });

      // check for user found
      if (!userData) {
        res.status(400).json({
          value: "",
          msg: "Incorrect email or password, please try again",
          param: "password",
          location: "body",
        });
        return;
      }

      // check if user is inactive
      if (!userData.isActive) {
        res.status(202).json({
          value: "",
          msg: "This user has been inactivated, please see your administrator",
          param: "password",
          location: "body",
        });
      }

      // validate password
      const validPwd = await userData.checkPassword(req.body.password);
      if (!validPwd) {
        res.status(400).json({
          value: "",
          msg: "Incorrect email or password, please try again",
          param: "password",
          location: "body",
        });
        return;
      }

      // Commit update
      await userData.update({ lastLogin: new Date() });

      delete userData.dataValues.password; //delete field password from return values

      const token = signToken({
        email: userData.email,
        userId: userData.userId,
      });

      logger.debug(JSON.stringify({ userData, token }));

      res.status(200).json({
        user: userData,
        token,
        message: "You are now logged in!",
      });
    } catch (err) {
      const errMsg = `Login Catch Error:\n ${err}`;
      logger.debug(JSON.stringify({ errorMsg: "Login Catch Error:\n", err }));
      res.status(400).json(errMsg);
    }
  },
];

/**
 * Use this route to update any of the user information - including the password.
 * This requires the user's password to change any information (even if it ISN'T the password)
 *
 * The req.body should have a JSON format of (only fields being changed are required
 * in the newData object):
 * {
 *    "userId": value,
 *    "oldPassword": "password",
 *    "newUserName": "newValue",
 *    "newEmail": "newValue",
 *    "newPassword": "newValue",
 *    "newIsAdmin": newValue,
 *    "newIsActive": newValue,
 *    "newRequestPwdReset": newValue
 *    }
 *  }
 */
exports.updateUser = [
  // Validate and sanitize fields.
  body("userId", "Missing userID").exists(),
  body("oldPassword", "Old password can't be blank").trim().notEmpty().escape(),
  // these fields are optional... the check for if any are missing is included in the function
  body("newUserName").trim().optional(),
  body("newEmail")
    .isEmail()
    .withMessage("Email must be a properly formatted email address")
    .custom(async (value) => {
      const user = await User.findAll({ where: { email: value } });
      if (user.length > 0) {
        throw new Error("Email already in use");
      }
    })
    .optional()
    .normalizeEmail(),
  body(
    "newPassword",
    "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
  )
    .isStrongPassword()
    .optional(),
  body("newIsAdmin").toBoolean().optional(),
  body("newIsActive").toBoolean().optional(),
  body("newRequestPwdReset").toBoolean().optional(),

  // function to update the user
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const oldPwd = req.body.oldPassword;

      // create newData object that will do the update to the User. This will only include fields that exist.
      // At the end, it will check if there are any missing fields and send an error in the same format as the
      // express-validator errors.
      const newData = {};
      if (req.body.newUserName) newData.userName = req.body.newUserName;
      if (req.body.newEmail) newData.email = req.body.newEmail;
      if (req.body.newPassword) newData.password = req.body.newPassword;
      if (req.body.newIsAdmin) newData.isAdmin = req.body.newIsAdmin;
      if (req.body.newIsActive) newData.isActive = req.body.newIsActive;
      if (req.body.newRequestPwdReset)
        newData.requestPwdReset = req.body.newRequestPwdReset;

      logger.debug(JSON.stringify({ newData }));
      if (Object.keys(newData).length === 0) {
        res.status(400).json([
          {
            value: newData,
            msg: "Nothing to update",
            param: "newData",
            location: "body",
          },
        ]);
        return;
      }

      // handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
        return;
      }

      // get the user to update
      const userData = await User.findByPk(userId);

      // check for user found
      if (!userData) {
        res.status(400).json({
          message: "Incorrect user ID or password, please try again",
          param: "password",
          location: "body",
        });
        return;
      }

      // validate password
      const validPwd = await userData.checkPassword(oldPwd);
      if (!validPwd) {
        res.status(400).json({
          message: "Incorrect user ID or password, please try again",
          param: "password",
          location: "body",
        });
        return;
      }

      // execute update of new data
      await userData.update(newData);

      // delete field password for return data
      delete userData.dataValues.password;

      res.json({
        user: userData,
        message: "Update Succeeded!",
      });
    } catch (err) {
      logger.debug(
        JSON.stringify({ errorMsg: "updateUser Catch Error:\n", err })
      );
      res.status(400).json({ message: err.message });
    }
  },
];
