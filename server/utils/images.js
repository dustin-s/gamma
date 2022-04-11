const sharp = require("sharp");

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
    // console.log("getImageLinks: path", path);
    await ensureDirExists(path);

    const { buffer, originalname } = file;
    const { fileName } = getFileName(originalname);
    const link = `${path}${fileName}.webp`;

    await sharp(buffer)
      .resize(RESIZE)
      .webp({ quality })
      .toFile(link)
      .catch((err) => {
        console.log(err);
        logger.debug(err, {
          controller: "getImageLinks",
          errorMsg: "getImageLinks Sharp Error writing file",
        });
        throw new Error(err);
      });

    // console.log("getImageLinks: link", link);
    return link;
  } catch (err) {
    console.log(err);
    logger.error(err, {
      controller: "getImageLinks",
      errorMsg: "catch error",
    });
  }
};
