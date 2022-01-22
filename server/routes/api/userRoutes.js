const router = require("express").Router();
const { User } = require("../../models");

// base url: http://localhost:3001/api/users/ +

/**
 * Use this route to create a new user.
 *
 * The req.body should have a JSON format of:
 * {
 *    "userName": "newValue",
 *    "email": "newValue",
 *    "password": "newValue",
 *    "isAdmin": newValue
 *  }
 *
 * Note:
 * isActive is assumed to be true.
 */
router.post("/signup", async (req, res) => {
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
});

/**
 * This is to submit a login. Response will contain the current information on the user.
 *
 * The req.body should have a JSON format of:
 * {
 *    "email": "newValue",
 *    "password": "newValue",
 *  }
 */
router.post("/login", async (req, res) => {
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
});

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
router.post("/update", async (req, res) => {
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
});

module.exports = router;
