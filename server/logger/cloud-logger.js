const { createLogger, format, transports } = require("winston");
const { combine, json, timestamp } = format;

const buildCloudLogger = () => {
  return createLogger({
    format: combine(timestamp(), json()),
    transports: [
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      // - Write all logs with importance level of `debug` or less to `debug.log`
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
  });
};

module.exports = buildCloudLogger;
