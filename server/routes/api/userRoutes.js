const router = require("express").Router();
const { User } = require("../../models");

router.get("/", async (req, res) => {
  console.log("hello");
  res("hello");
});

// Login (email and password expected)
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

    // validate password
    const validPwd = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // **********************************************************************
    // ToDo: Deal with session (JWT/Session/OAuth)
    // **********************************************************************
    res.json({ user: userData, message: "You are now logged in!" });
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
