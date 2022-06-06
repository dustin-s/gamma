// this is heavily influenced by: https://www.youtube.com/watch?v=A5YiqaQbsyI&ab_channel=productioncoder
const { loggers } = require("winston");
const buildCloudLogger = require("./cloud-logger");
const buildLocalLogger = require("./local-logger");

const makeLogger = () => {
  let logger = null;

  // check for how to display the logs. Local Logger displays to console, while Cloud Logger writes to files.
  if (typeof PhusionPassenger === "undefined") {
    logger = buildLocalLogger();
  } else {
    logger = buildCloudLogger();
  }

  // this allows me to use winston.loggers.get("logger") command to access in other files.
  loggers.add("logger", logger);
};

module.exports = makeLogger();
