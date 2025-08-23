const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const config = require("../config");

const logger = createLogger({
  level: process.env.NODE_ENV == "production" ? "info" : "debug",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new DailyRotateFile({
      filename: config.winston.errorFilename,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: config.winston.maxSize,
      maxFiles: config.winston.maxFiles,
      dirname: path.join("storage", config.fileDir.log),
      level: "error",
    }),
    new DailyRotateFile({
      filename: config.winston.logFilename,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: config.winston.maxSize,
      maxFiles: config.winston.maxFiles,
      dirname: path.join("storage", config.fileDir.log),
    }),
  ],
});

if (process.env.NODE_ENV != "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

module.exports = logger;
