const passport = require("passport");
const channelController = require("../controllers/admin/channelsController");

const channels = (router) => {
  router.use(passport.authenticate("jwt", { session: false }));
  router.get("/", channelController.list);
  router.get("/:id", channelController.show);
  router.post("/:id/read", channelController.markRead);
  return router;
};

module.exports = channels;
