// This file stores the configurations for the image uploads
const multer = require("multer");

// Image size, pick one
const IMAGE_WIDTH = 1500; //px
// const IMAGE_HEIGHT = 1500; //px

const storage = multer.memoryStorage;
const upload = multer({ storage });

exports.fieldsUpload = upload.fields([{ name: "poi" }]);
