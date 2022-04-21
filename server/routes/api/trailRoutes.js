const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { fieldsUpload } = require("../../config/imageUpload");

const { listTrails, saveTrail } = require("../../controllers/trailControllers");
const { addPOI, updatePOI } = require("../../controllers/poiControllers");
const { saveTrailValidator } = require("../../validators/saveTrailValidator");

// base url: https://gamma.lessthangeeky.com/api/trails/ +

router.get("/", listTrails);

router.post(
  "/",
  verifyToken,
  fieldsUpload,
  saveTrailValidator,
  saveTrail,
  listTrails
);

router.post("/addPOI", verifyToken, fieldsUpload, addPOI);
router.post("/updatePOI", verifyToken, fieldsUpload, updatePOI);

// get "/:trailId", <-- returns all trail details (POIs, Hazards, etc.)
// post "/:trailId/close", verifyToken,
// post "/:trailID/add_hazard"
// post "/:trailID/add_poi", verifyToken,

module.exports = router;
