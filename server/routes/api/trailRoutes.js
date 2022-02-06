const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { listTrails, saveTrail } = require("../../controllers/trailControllers");

router.get("/", listTrails);

router.post("/", /* verifyToken,*/ saveTrail);

// get "/:trailId", <-- returns all trail details (POIs, Hazards, etc.)
// post "/:trailId/close", verifyToken,
// post "/:trailID/add_hazard"
// post "/:trailID/add_poi", verifyToken,

module.exports = router;
