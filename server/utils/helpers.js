exports.validationErrors = (arr) =>
  arr.map((el) => [el.param, el.msg].join(": ")).join("\n");

/**
 * Returns the length of the array, or if it isn't an array, it returns 1
 *
 * @param {*} value
 * @returns
 */
exports.arrayLength = (value) => (Array.isArray(value) ? value.length : 1);

/**
 * Checks the length of arrays that begin with the input objectName on the body to ensure they are all the same length
 *
 * @param {*} body a group of properties
 * @param {string} objectName the name of the object you are looking for ("objectName_property")
 * @returns true/false
 */
exports.checkLengthOfObjectArrays = (body, objectName) => {
  const newObj = [];

  for (const [key, value] of Object.entries(body)) {
    if (key.split("_")[0] === objectName) {
      newObj.push(this.arrayLength(value));
    }
  }

  return newObj.every((val) => val === newObj[0]);
};

/**
 * Takes a group of items that being with "objectName_" and converts them in to an array of objects. If there is only 1 item in the array, it will still return an array with a length === 1.
 *
 * Note: Arrays are assumed to be the same length. If they are not, then some objects in the returned array may be malformed.
 *
 * @param {*} body a group of properties
 * @param {string} objectName the name of the object you are looking for ("objectName_property")
 * @returns {object[]} an array of objects
 */
exports.makeObjectArray = (body, objectName) => {
  try {
    const newObjArr = [];

    for (const [key, value] of Object.entries(body)) {
      const properties = key.split("_");

      if (properties[0] === objectName) {
        properties.shift();
        let newProp = properties.join("_");

        if (Array.isArray(value)) {
          value.forEach((val, index) => {
            newObjArr[index]
              ? (newObjArr[index][newProp] = val)
              : newObjArr.push({ [newProp]: val });
          });
        } else {
          newObjArr[0]
            ? (newObjArr[0][newProp] = value)
            : newObjArr.push({ [newProp]: value });
        }
      }
    }

    return newObjArr;
  } catch (err) {
    console.log(err);
  }
};
