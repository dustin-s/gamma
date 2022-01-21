const router = require("express").Router();

// import route files
const userRoutes = require("./userRoutes");

// setup routes
router.use("/users", userRoutes);

// export router
module.exports = router;
