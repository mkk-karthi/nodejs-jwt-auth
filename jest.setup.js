const sequelize = require("./services/database");

beforeAll(async () => {
  // reset test DB
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
