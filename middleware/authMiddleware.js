const jwt = require("jsonwebtoken");
const helpers = require("../helpers");
const logger = require("../services/logger");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return helpers.response(res, "Token is required", {}, 401);
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    logger.error("logout error:", err);
    helpers.response(res, "Invalid access token", {}, 403);
  }
};
