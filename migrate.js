require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sequelize = require("./services/database");
const basename = path.basename(__filename);

const models = {};
fs.readdirSync(path.join(__dirname, "models"))
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, "models", file));
    models[model.name] = model;
  });

const run = async () => {
  if (process.argv.slice(2).includes("refresh")) {
    await sequelize.sync({ force: true });
  } else {
    await sequelize.sync({ alter: true });
  }
  process.exit();
};
run();
