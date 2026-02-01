const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const fs = require('fs');

if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
}

if (!fs.existsSync(config.convertedDir)) {
    fs.mkdirSync(config.convertedDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

const fileFilter = function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allAllowed = [
        ...config.allowedFormats.document,
        ...config.allowedFormats.image,
        ...config.allowedFormats.audio,
        ...config.allowedFormats.video,
        ...config.allowedFormats.archive
    ];

    if (allAllowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${ext} is not supported`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.maxFileSize
    }
});

module.exports = upload;
