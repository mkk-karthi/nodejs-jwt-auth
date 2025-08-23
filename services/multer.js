const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config");

const tempDir = path.join("storage", config.fileDir.temp);
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// link upload path to public (static)
const storageDir = path.join(config.appPath, "storage", config.fileDir.upload);
const publicDir = path.join(config.appPath, "public", config.fileDir.upload);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.symlinkSync(storageDir, publicDir, "dir");
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(config.multerFileTypeError), false);
  }
};

// config multer
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
