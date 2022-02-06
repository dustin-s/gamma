const router = require("express").Router();
const { listTrails } = require("../../controllers/trailControllers");

router.get("/", listTrails);

module.exports = router;
