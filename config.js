module.exports = {
  appName: "Microservices in Express.js",
  appPath: __dirname,
  rateLimit: {
    maxReq: 100,
    maxMin: 15,
  },
  whiteListOrigins: ["localhost:8080"],
  fileDir: {
    temp: "temp",
    upload: "uploads",
    log: "logs",
  },
  maxFileSize: 5, // 5MB
  multerFileTypeError: "INVALID_FILE_TYPE",
  passwordPattern:
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@.#$!%*?&^])[A-Za-z0-9@.#$!%*?&]{8,}$",

  winston: {
    maxSize: "20m",
    maxFiles: "14d",
    logFilename: "log-%DATE%.log",
    errorFilename: "error-%DATE%.log",
  },
};
