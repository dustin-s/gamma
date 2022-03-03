const winston = require("winston");
const { combine, json, timestamp } = winston.format;

const buildLogger = () => {
  return (logger = winston.createLogger({
    level: "info",
    format: combine(timestamp(), json()),
    defaultMeta: { service: "user-service" },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({
        filename: "log/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "log/combined.log" }),
      new winston.transports.File({ filename: "log/debug.log" }),
    ],
  }));
};

module.exports = buildLogger;
