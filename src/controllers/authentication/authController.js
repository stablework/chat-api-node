const mongoose = require("mongoose");
const passport = require("passport");
const { apiInternalServerError } = require("../../exceptions/apiErrors");
const { _success, _error, _unauthorized } = require("../../helpers/common");
const { signToken } = require("../../helpers/authToken");

const login = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return apiInternalServerError(res, "Database not connected");
  }

  if (!process.env.JWT_SECRET) {
    return apiInternalServerError(res, "JWT_SECRET is not set");
  }

  passport.authenticate("local", { session: false }, (err, user) => {
    try {
      if (err) {
        console.error("Login error:", err);
        return apiInternalServerError(res, err.message || "Login failed");
      }

      if (!user || !["admin", "guest"].includes(user.role)) {
        return _unauthorized(res, "Invalid Credentials");
      }

      if (user.status !== "active") {
        return _success(res, "Account is inactive", {}, false);
      }

      return _success(res, "Login successful", { token: signToken(user) });
    } catch (error) {
      console.error("Login error:", error);
      return apiInternalServerError(res, error.message);
    }
  })(req, res, next);
};

const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) return _error(res, "Logout failed", err);
      return _success(res, "Logout successfully");
    });
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

module.exports = {
  login,
  logout,
};
