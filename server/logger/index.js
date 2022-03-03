const { transports, format } = require("winston");
const { combine, colorize, simple } = format;
const buildLogger = require("./dev-logger");

let logger = buildLogger();

//
// If we're not on the  production server then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (typeof PhusionPassenger === "undefined") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple()),
    })
  );
}
console.log("typeof logger:", typeof logger.info);
console.log(logger);
console.log();

logger.info("info message from index.js");
logger.error("error message from index.js");

exports.module = { logger };
