const passport = require("passport");
const validation = require("../helpers/validation");
const requireAdmin = require("../helpers/requireAdmin");
const authController = require("../controllers/authentication/authController");
const inviteController = require("../controllers/admin/inviteController");

const admin = (router) => {
  router.get("/login", (req, res) => {
    res.json({ status: true, message: "login endpoint reachable" });
  });
  router.post("/login", validation("login"), authController.login);
  router.use(passport.authenticate("jwt", { session: false }));
  router.post("/logout", authController.logout);

  router.use(requireAdmin);
  router.get("/invites/latest", inviteController.latest);
  router.post("/invites", inviteController.create);
  router.get("/invites/:id", inviteController.show);
  router.delete("/invites/:id", inviteController.destroy);

  return router;
};

module.exports = admin;
