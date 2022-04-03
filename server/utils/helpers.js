exports.validationErrors = (arr) => arr.map((el) => el.msg).join("\n");

/**
 * Returns the length of the array, or if it isn't an array, it returns 1
 *
 * @param {*} value
 * @returns
 */
exports.arrayLength = (value) => (Array.isArray(value) ? value.length : 1);

exports.checkLengthOfObjectArrays = (body, objectName) => {
  const newObj = [];

  for (const [key, value] of Object.entries(body)) {
    if (key.split("_")[0] === objectName) {
      newObj.push(Array.isArray(value) ? value.length : 1);
    }
  }

  return newObj.every((val) => val === newObj[0]);
};
