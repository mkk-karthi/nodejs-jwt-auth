const express = require("express");
const config = require("./config");
const app = express();

// setup dotenv
if (process.env.NODE_ENV === "test") {
  require("dotenv").config({
    path: "./.env.test",
  });
} else {
  require("dotenv").config();
}

// set static public path
app.use("/public", express.static("public"));

// config body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// config cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// config helmet
const helmet = require("helmet");
app.use(helmet());

// config rate limit
const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: config.rateLimit.maxMin * 60 * 1000,
    max: config.rateLimit.maxReq,
    message: "Too Many Requests",
    // store:
  })
);

// setup logger middleware
const logger = require("./services/logger");
app.use((req, res, next) => {
  req.logger = logger;
  const { method, url, ip } = req;

  next();

  logger.info("Request received", {
    method: method,
    url: url,
    ip: ip,
    statusCode: res.statusCode,
  });
});

// config swagger
const { swaggerUi, swaggerSpec } = require("./services/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// config cors
const cors = require("cors");
const corsOptions = {
  origin: function (origin, callback) {
    if (config.whiteListOrigins && config.whiteListOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
};

const router = require("./routes/apiRoutes");
app.use("/", cors(corsOptions), router);

// error handling middleware
const multer = require("multer");
const helpers = require("./helpers");
app.use((err, req, res, next) => {
  logger.error("Express error:", err);

  // multer error
  if (
    err instanceof multer.MulterError ||
    [config.multerFileTypeError].includes(err.message)
  ) {
    helpers.response(res, "File not uploaded", {}, 500);
  } else {
    helpers.response(res, "Internal server error", {}, 500);
  }
});

module.exports = app;
