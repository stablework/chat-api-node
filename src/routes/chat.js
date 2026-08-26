const passport = require("passport");
const fileUpload = require("../helpers/fileUpload");
const { _filesData } = require("../helpers/common");
const serveChatFile = require("../helpers/serveChatFile");
const chatController = require("../controllers/common/chatController");
const authController = require("../controllers/authentication/authController");

const chat = (router) => {
  router.get("/files/:filename", serveChatFile);
  router.use(passport.authenticate("jwt", { session: false }));
  router.post("/logout", authController.logout);

  router.post(
    "/",
    fileUpload(_filesData("chat-files").path).array(_filesData("chat-files").name),
    chatController.create
  );
  router.get("/list/", chatController.list);
  router.put("/:id", chatController.update);
  router.delete("/:id", chatController.destroy);
  router.post("/reaction/add", chatController.addReaction);
  router.post("/reaction/remove", chatController.removeReaction);

  return router;
};

module.exports = chat;
