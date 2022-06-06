const sharp = require("sharp");
const fs = require("fs");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const {
  SAVE_DIRECTORY,
  QUALITY: quality,
  RESIZE,
} = require("../config/imageUpload");
const { ensureDirExists, getFileName } = require("./fileHelpers");

/**
 * Takes in a trailId, file (from req.files) and a type, either POI or Hazard to define where the image will be stored. Images will be stored in:
 *
 *    ./public/images/<trailId>/<POI | Hazard>/
 *
 * @param {number} trailId
 * @param {fileObject} file
 * @param {"POI" | "Hazard"} type
 * @returns The link to the files storage location
 */

exports.getImageLinks = async (trailId, file, type) => {
  try {
    // ensure filesystem exists for save
    const path = `${SAVE_DIRECTORY}${trailId}/${type}/`;
    const fullPath = "public/" + path;

    // console.log("getImageLinks: path", path);
    await ensureDirExists(fullPath);

    const { buffer, originalname } = file;
    const { fileName } = getFileName(originalname);
    const link = `${fileName}.jpg`;

    await sharp(buffer)
      .resize(RESIZE)
      .jpeg({ quality })
      .toFile(fullPath + link)
      .catch((err) => {
        console.log(err);
        logger.error(err, {
          controller: "getImageLinks",
          errorMsg: "getImageLinks Sharp Error writing file",
        });
        throw new Error(err);
      });

    // console.log("getImageLinks: link", link);
    return path + link;
  } catch (err) {
    console.log(err);
    logger.error(err, {
      controller: "getImageLinks",
      errorMsg: "catch error",
    });
  }
};

/**
 * removes the image specified in the path location. This does not return an error to the calling function, but will log it in the error logs.
 *
 * @param {string} path the location of the file to be deleted (including filename)
 */
exports.removeImage = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
    logger.error(err, {
      controller: "removeImage",
      errorMsg: "catch error",
    });
  }
};
