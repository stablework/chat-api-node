const bcrypt = require("bcrypt");
const User = require("../../models/user");

const user = async () => {
  const password = await bcrypt.hash("123456", 10);
  await User.findOneAndUpdate(
    { email: "admin@admin.com" },
    {
      name: "Admin",
      email: "admin@admin.com",
      password,
      role: "admin",
      status: "active",
    },
    { upsert: true, new: true }
  );
};

module.exports = user;
