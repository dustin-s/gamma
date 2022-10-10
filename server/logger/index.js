// this is heavily influenced by: https://www.youtube.com/watch?v=A5YiqaQbsyI&ab_channel=productioncoder
const { loggers } = require("winston");
const buildCloudLogger = require("./cloud-logger");
const buildLocalLogger = require("./local-logger");

const makeLogger = () => {
  let logger = null;

  if (typeof PhusionPassenger === "undefined") {
    logger = buildLocalLogger();
  } else {
    logger = buildCloudLogger();
  }

  loggers.add("logger", logger);
};

module.exports = makeLogger();
