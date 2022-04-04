// This file stores the configurations for the image uploads
const multer = require("multer");

// Image size, pick one, aspect ration will be saved that way
// if both width and height are chosen, fit describes how the image will resize. See https://sharp.pixelplumbing.com/api-resize for more information on this.
exports.RESIZE = {
  width: 1500, //px
  // height: 1500, //px
  // fit: sharp.fit.contain,
};

// Quality is a value between 1 and 100. The higher the quality, the more space it will take up.  Sharp sets the default at 80. However in Flothemes (https://flothemes.com/flothemes-image-sizes/), a wordpress photography site, they recommend 75 being the cutoff for people to tell the difference: "On the upper end of the quality scale, there are diminishing returns. The difference in perceived quality between an 75% and 100% quality setting is hard to see, but it increases the file size significantly."
exports.QUALITY = 75;

// This will define the base folder where images will be saved Note: this must end with a "/"
exports.SAVE_DIRECTORY = "./public/images/";

// The extensions that are valid for the file upload. These will be checked against their expected mime type.
exports.VALID_IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp"];

//
// ******************
//
// Set up Multer -- these should only be set by developers

// Storage is either memory or disk
const storage = multer.memoryStorage();

// This is the function to upload folders, it could be used as middleware if exported
const upload = multer({ storage });

// middleware to upload the images. Add any other keys to the array that will need to be uploaded
exports.fieldsUpload = upload.fields([{ name: "POI_image" }]);
