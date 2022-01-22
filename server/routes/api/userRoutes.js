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
    req.body.lastPwdUpdate = new Date();

    console.log(req.body);

    const newUser = await User.create(req.body);

    // **********************************************************************
    // ToDo: Deal with session (JWT/Session/OAuth)
    // **********************************************************************

    res.status(201).json(newUser);
  } catch (err) {
    const { message } = err;
    if (message === "Validation error") {
      res.status(400).json(err);
    }
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
    console.log(req.body);

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

    const user = {};
    for (const [key, value] of Object.entries(userData.dataValues)) {
      if (key !== "password") {
        user[key] = value;
      }
    }

    // **********************************************************************
    // ToDo: Deal with session (JWT/Session/OAuth)
    // **********************************************************************
    res.json({ user: user, message: "You are now logged in!" });
  } catch (err) {
    console.log("Login Catch Error:\n", err);
    res.status(400).json(err);
  }
});

module.exports = router;
