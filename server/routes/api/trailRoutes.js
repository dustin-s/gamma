const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { fieldsUpload } = require("../../config/imageUpload");

const {
  listTrails,
  saveTrail,
  toggleCloseTrail,
} = require("../../controllers/trailControllers");
const { addPOI, updatePOI } = require("../../controllers/poiControllers");
const {
  saveTrailValidator,
  toggleCloseTrailValidator,
} = require("../../validators/trailValidator");
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

router.post(
  "/toggleClose",
  verifyToken,
  toggleCloseTrailValidator,
  toggleCloseTrail,
  listTrails
);
// post "/:trailID/add_hazard"

module.exports = router;
