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
      newObj.push(this.arrayLength(value));
    }
  }

  return newObj.every((val) => val === newObj[0]);
};

exports.makeObjectArray = (body, objectName) => {
  // console.log("****** makeObjectArray Start ******");

  try {
    const newObjArr = [];

    for (const [key, value] of Object.entries(body)) {
      const properties = key.split("_");

      if (properties[0] === objectName) {
        properties.shift(); // remove the current objectName
        let newProp = properties.join("_"); // rejoin the property name with removed underscores

        // if the value is an array, add multiple objects, otherwise just add 1
        // also ensure that if the object already exists, add to it, otherwise, create it.
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

    // console.log("newObjArr:", newObjArr);
    // console.log("****** makeObjectArray End ******");
    return newObjArr;
  } catch (err) {
    console.log(err);
  }
};
