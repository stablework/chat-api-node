const passport = require("passport");
const { apiInternalServerError } = require("../../exceptions/apiErrors");
const { _success, _error, _unauthorized } = require("../../helpers/common");
const { signToken } = require("../../helpers/authToken");

const login = async (req, res, next) => {
  try {
    passport.authenticate("local", (err, user) => {
      if (err || !user) {
        return _unauthorized(res, "Invalid Credentials");
      }

      if (!["admin", "guest"].includes(user.role)) {
        return _unauthorized(res, "Invalid Credentials");
      }

      if (user.status == "active") {
        return _success(res, "Login successful", { token: signToken(user) });
      }
      return _success(res, "Account is inactive", {}, false);
    })(req, res, next);
  } catch (err) {
    return apiInternalServerError(res, err.message);
  }
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
