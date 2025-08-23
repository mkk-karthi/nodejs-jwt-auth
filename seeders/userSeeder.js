const User = require("../models/user");

module.exports = async () => {
  await User.bulkCreate([
    {
      name: "admin",
      email: "admin@gmail.com",
      password: "Admin@123",
      status: "1",
    },
    {
      name: "user",
      email: "user@gmail.com",
      password: "User@123",
      status: "2",
    },
  ]);
};
