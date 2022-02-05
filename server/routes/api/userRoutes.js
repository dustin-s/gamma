const router = require("express").Router();
const {
  newUser,
  login,
  updateUser,
} = require("../../controllers/userControllers");

// base url: http://localhost:3001/api/users/ +

// router.post("/signup", newUser);

router.post("/login", login);

router.post("/update", updateUser);

module.exports = router;
