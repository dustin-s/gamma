const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { fieldsUpload } = require("../../config/imageUpload");

const { listTrails, saveTrail } = require("../../controllers/trailControllers");
const { addPOI } = require("../../controllers/poiControllers");

// base url: https://gamma.lessthangeeky.com/api/trails/ +

router.get("/", listTrails);

router.post("/", verifyToken, fieldsUpload, saveTrail);

router.post("/addPOI", verifyToken, fieldsUpload, addPOI);
// router.post("/updatePOI:pointsOfInterestId", verifyToken, fieldsUpload, savePOI);

// get "/:trailId", <-- returns all trail details (POIs, Hazards, etc.)
// post "/:trailId/close", verifyToken,
// post "/:trailID/add_hazard"
// post "/:trailID/add_poi", verifyToken,

module.exports = router;
