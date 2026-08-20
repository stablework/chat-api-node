const jwt = require("jsonwebtoken");

const toAuthUser = (user) => ({
  id: user.id || user._id.toString(),
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  status: user.status,
});

const signToken = (user, expiresIn = "30d") =>
  jwt.sign(toAuthUser(user), process.env.JWT_SECRET, { expiresIn });

module.exports = { toAuthUser, signToken };
