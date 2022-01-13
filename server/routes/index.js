const router = require("express").Router();

// import route files
const apiRoutes = require("./api");

// setup routes
router.use("/api", apiRoutes);

// export router
module.exports = router;
