const router = require("express").Router();

// import route files
const homeRoutes = require("./homeRoutes");
const apiRoutes = require("./api");

// setup routes
router.use("/", homeRoutes);
router.use("/api", apiRoutes);

// export router
module.exports = router;
