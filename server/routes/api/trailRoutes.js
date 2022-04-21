const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { fieldsUpload } = require("../../config/imageUpload");

const { listTrails, saveTrail } = require("../../controllers/trailControllers");
const { addPOI, updatePOI } = require("../../controllers/poiControllers");
const { saveTrailValidator } = require("../../validators/saveTrailValidator");
const {
  addPOIValidator,
  updatePOIValidator,
} = require("../../validators/pOIValidators");

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

router.post(
  "/addPOI",
  verifyToken,
  fieldsUpload,
  addPOIValidator,
  addPOI,
  listTrails
);
router.post(
  "/updatePOI",
  verifyToken,
  fieldsUpload,
  updatePOIValidator,
  updatePOI,
  listTrails
);

// get "/:trailId", <-- returns all trail details (POIs, Hazards, etc.)
// post "/:trailId/close", verifyToken,
// post "/:trailID/add_hazard"
// post "/:trailID/add_poi", verifyToken,

module.exports = router;
