const { createLogger, format, transports } = require("winston");
const { colorize, combine, errors, printf, timestamp } = format;

const myFormat = printf(({ level, message, stack, timestamp }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const buildLocalLogger = () => {
  return {
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      myFormat
    ),
    transports: [
      new transports.Console({
        level: "debug",
      }),
    ],
  };
};

module.exports = buildLocalLogger;
