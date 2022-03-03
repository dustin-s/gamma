const { loggers } = require("winston");
const buildCloudLogger = require("./cloud-logger");
const buildLocalLogger = require("./local-logger");

let logger = null;

// check for how to display the logs. Local Logger displays to console, while Cloud Logger writes to files.
if (typeof PhusionPassenger === "undefined") {
  logger = buildLocalLogger();
} else {
  logger = buildCloudLogger();
}

loggers.add("logger", logger);

module.exports = logger;
