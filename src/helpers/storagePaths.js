const path = require("path");

const storageRoot = path.join(__dirname, "..", "..", "storage");
const chatFilesDir = path.join(storageRoot, "chat", "files");

module.exports = {
  storageRoot,
  chatFilesDir,
};
