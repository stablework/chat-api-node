const path = require("path");
const { chatFilesDir } = require("./storagePaths");

const serveChatFile = (req, res, next) => {
  const filename = path.basename(req.params.filename || "");
  if (!filename || filename === "." || filename === "..") {
    return res.status(404).json({ status: false, message: "File not found" });
  }

  return res.sendFile(filename, { root: chatFilesDir, dotfiles: "deny" }, (err) => {
    if (!err) return;
    if (err.status === 404 || err.code === "ENOENT") {
      return res.status(404).json({ status: false, message: "File not found" });
    }
    return next(err);
  });
};

module.exports = serveChatFile;
