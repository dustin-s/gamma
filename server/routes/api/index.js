const router = require("express").Router();

// import route files
const userRoutes = require("./userRoutes");
const trailRoutes = require("./trailRoutes");

// setup routes
router.use("/users", userRoutes);
router.use("/trails", trailRoutes);

// export router
module.exports = router;
