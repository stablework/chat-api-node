const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { storageRoot } = require("./storagePaths");

const fileUpload = (relativePath) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = path.join(storageRoot, relativePath);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const originalname = file.originalname;
      const extension = originalname.split(".").pop();
      cb(null, originalname.replace(`.${extension}`, "") + "-" + uniqueSuffix + "." + extension);
    },
  });

  return multer({ storage });
};

module.exports = fileUpload;
