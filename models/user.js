const { DataTypes } = require("sequelize");
const sequelize = require("../services/database");
const bcrypt = require("bcrypt");

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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    avatar: {
      type: DataTypes.STRING,
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

const encryptPassword = async (user, options) => {
  // bcrypt password
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
  }
};

User.beforeCreate(encryptPassword);
User.beforeUpdate(encryptPassword);

User.beforeBulkCreate(async (users, options) => {
  for (const user of users) {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
    }
  }
});

module.exports = User;
