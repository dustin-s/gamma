const { body, validationResult } = require("express-validator");
const { signToken } = require("../utils/auth");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const { User } = require("../models");
const { validationErrors } = require("../utils/helpers");

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

  async (req, res) => {
    const controller = "newUser";
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error(errors.array(), {
          controller,
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
        return;
      }

      const newData = req.body;
      newData.lastLogin = new Date();

      const newUser = await User.create(newData);

      delete newUser.dataValues.password;

      const token = signToken({ email: newUser.email, userId: newUser.userId });

      res.status(201).json({ newUser, token });
    } catch (err) {
      const { message } = err;
      if (message === "Validation error") {
        res.status(400).json({ error: err });
      }
      logger.debug(err, {
        controller,
        errorMsg: "catch error",
      });
      res.status(500).json({ error: err });
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
  body("email", "Email can't be blank").trim().notEmpty().normalizeEmail(),
  body("password", "Password can't be blank").trim().notEmpty().escape(),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array(), {
          controller: "login",
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
        return;
      }

      const userData = await User.findOne({ where: { email: req.body.email } });

      if (!userData) {
        logger.debug("user not found", {
          controller: "login",
        });
        res.status(400).json({ error: "user not found" });
        return;
      }

      if (!userData.isActive) {
        logger.debug("user is inactive", {
          controller: "login",
        });
        res.status(202).json({
          error:
            "This user has been inactivated, please see your administrator",
        });
      }

      const validPwd = await userData.checkPassword(req.body.password);
      if (!validPwd) {
        logger.debug("bad password", {
          controller: "login",
        });
        res
          .status(400)
          .json({ error: "Incorrect email or password, please try again" });
        return;
      }

      await userData.update({ lastLogin: new Date() });

      delete userData.dataValues.password;

      const token = signToken({
        email: userData.email,
        userId: userData.userId,
      });

      logger.debug(JSON.stringify({ userData, token }), {
        controller: "login",
      });

      res.status(200).json({
        user: userData,
        token,
        message: "You are now logged in!",
      });
    } catch (err) {
      const errMsg = `Login Catch Error:\n ${err.stack}`;
      logger.debug(err, { errorMsg: "Login Catch Error", controller: "login" });
      res.status(400).json({ error: errMsg });
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
 *    "oldPassword": password,
 *    "newUserName": newValue,
 *    "newEmail": newValue,
 *    "newPassword": newValue,
 *    "newIsAdmin": newValue,
 *    "newIsActive": newValue,
 *    "newRequestPwdReset": newValue
 *    }
 *  }
 *
 * Note: you can only update requestPwdReset if you don't also change the password. Updating the password automatically sets the request to false.
 */
exports.updateUser = [
  body("userId", "Missing userID").exists(),
  body("oldPassword", "Old password can't be blank").trim().notEmpty().escape(),
  body("newUserName", "Username cannot be blank").optional().trim().notEmpty(),
  body("newEmail")
    .optional()
    .isEmail()
    .withMessage("Email must be a properly formatted email address")
    .bail()
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findAll({ where: { email: value } });
      if (user.length > 0) {
        throw new Error("Email already in use");
      }
    }),
  body("newPassword")
    .optional()
    .trim()
    .escape()
    .isStrongPassword()
    .withMessage(
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
    )
    .custom((value, { req }) => value !== req.body.oldPassword)
    .withMessage("New password can not match old password"),
  body(["newIsAdmin", "newIsActive", "newRequestPwdReset"])
    .optional()
    .toBoolean(),

  async (req, res) => {
    const controller = "updateUser";
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.debug(errors.array, {
          controller,
          errorMsg: "validation error",
        });
        res.status(400).json({ error: validationErrors(errors.array()) });
        return;
      }

      const userId = req.body.userId;
      const oldPwd = req.body.oldPassword;

      const user = await User.findByPk(userId);

      if (!user) {
        logger.debug("user not found", {
          controller,
        });
        res
          .status(400)
          .json({ error: "Incorrect user ID or password, please try again" });
        return;
      }

      const validPwd = await user.checkPassword(oldPwd);
      if (!validPwd) {
        logger.debug("invalid Password", {
          controller,
        });
        res.status(400).json({
          error: "Incorrect user ID or password, please try again",
        });
        return;
      }

      const newData = {};
      if ("newUserName" in req.body) newData.userName = req.body.newUserName;
      if ("newEmail" in req.body) newData.email = req.body.newEmail;
      if ("newPassword" in req.body) newData.password = req.body.newPassword;
      if ("newIsAdmin" in req.body) newData.isAdmin = req.body.newIsAdmin;
      if ("newIsActive" in req.body) newData.isActive = req.body.newIsActive;
      if ("newRequestPwdReset" in req.body)
        newData.requestPwdReset = req.body.newRequestPwdReset;

      await user.update(newData);

      delete user.dataValues.password;

      const token = signToken({ email: user.email, userId: user.userId });

      res.json({
        user: user,
        token,
        message: "Update Succeeded!",
      });
    } catch (err) {
      logger.error(err, {
        controller,
        errorMsg: "updateUser Catch Error",
      });
      res.status(400).json({ error: err.message });
    }
  },
];
