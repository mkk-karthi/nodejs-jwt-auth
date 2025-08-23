const RefreshToken = require("../models/refreshToken");
const User = require("../models/user");
const sequelize = require("../services/database");

beforeAll(async () => {
  // reset test DB
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await User.truncate();
  await RefreshToken.truncate();
  await User.truncate();
  await sequelize.close();
});