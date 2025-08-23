const { DataTypes } = require("sequelize");
const sequelize = require("../services/database");
const User = require("./user");

const Otp = sequelize.define("otp", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Otp.belongsTo(User, { foreignKey: "userId" });

module.exports = Otp;
