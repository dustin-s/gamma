const router = require("express").Router();
const { verifyToken } = require("../../utils/auth");

const { fieldsUpload } = require("../../config/imageUpload");

const {
  listTrails,
  saveTrail,
  updateTrail,
  deleteTrail,
} = require("../../controllers/trailControllers");
const { addPOI, updatePOI } = require("../../controllers/poiControllers");
const {
  saveTrailValidator,
  updateTrailValidator,
} = require("../../validators/trailValidator");
const {
  addPOIValidator,
  updatePOIValidator,
} = require("../../validators/pOIValidators");

// base url: https://gamma.lessthangeeky.com/api/trails/ +

router.get("/", listTrails);

router.post("/", verifyToken, fieldsUpload, saveTrailValidator, saveTrail);
router.post("/updateTrail", verifyToken, updateTrailValidator, updateTrail);
router.delete("/:trailId", verifyToken, deleteTrail, listTrails);

router.post("/addPOI", verifyToken, fieldsUpload, addPOIValidator, addPOI);
router.post(
  "/updatePOI",
  verifyToken,
  fieldsUpload,
  updatePOIValidator,
  updatePOI
);
// post "/:trailID/add_hazard"

module.exports = router;
