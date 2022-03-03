const router = require("express").Router();
const {
  newUser,
  login,
  updateUser,
} = require("../../controllers/userControllers");

// base url: https://gamma.lessthangeeky.com/api/users/ +

router.post("/signup", newUser);

router.post("/login", login);

router.post("/update", updateUser);

module.exports = router;
