const { apiForbidden } = require("../exceptions/apiErrors");

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return apiForbidden(res, "Admin access required");
  }
  return next();
};

module.exports = requireAdmin;
