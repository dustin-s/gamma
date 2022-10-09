const { format, transports } = require("winston");
const { combine, json, timestamp } = format;

const buildCloudLogger = () => {
  return {
    format: combine(timestamp(), json()),
    transports: [
      new transports.File({
        filename: "log/error.log",
        level: "error",
      }),
      new transports.File({
        filename: "log/combined.log",
        level: "info",
      }),
      new transports.File({
        filename: "log/debug.log",
        level: "debug",
      }),
    ],
  };
};

module.exports = buildCloudLogger;
