const fs = require("fs");

/**
 * Split and format the original filename of a file so that the filename is returned with a "-" instead of a space.
 *
 * @param {string} originalname
 * @returns object with filename formatted with dashes for spaces and extension
 */
exports.getFileName = (originalname) => {
  const origFullName = originalname.split(".");
  const ext = origFullName.pop();
  const fileName = origFullName.join(".").split(" ").join("-");
  return { fileName, ext };
};

/**
 * Checks to see if a directory exists. If not, it will create the directory. This is recursive.
 *
 * @param {string} path
 * @returns undefined if it already exists | last directory path if it was created
 */
exports.ensureDirExists = async (path) => {
  try {
    return await fs.promises.access(path);
  } catch (error) {
    return await fs.promises.mkdir(path, { recursive: true });
  }
};

/**
 * Deletes the director at path and all subdirectories.
 *
 * @param {string} path
 * @returns true if successfully deleted the directory or false if the directory doesn't exist
 */
exports.deleteDir = async (path) => {
  try {
    await fs.promises.access(path);
  } catch (error) {
    return false;
  }
  try {
    await fs.promises.rm(path, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.log("deleteDir catch error:");
    console.log(err);
    throw new Error(err);
  }
};
