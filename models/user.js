const { DataTypes } = require("sequelize");
const sequelize = require("../services/database");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    avatar:{
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM("1", "2"),
      defaultValue: "1",
      comment: "1-active; 2-inactive;",
    },
  },
  {
    timestamps: true,
    defaultScope: {
      attributes: ["id", "name", "email", "dob", "avatar", "status"],
      order: ["id"],
      limit: 10,
    },
  }
);

module.exports = User;
