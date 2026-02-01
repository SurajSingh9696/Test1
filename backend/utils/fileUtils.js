const path = require('path');
const fs = require('fs');

const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

const getFileNameWithoutExtension = (filename) => {
    return path.basename(filename, path.extname(filename));
};

const generateOutputPath = (inputPath, outputFormat, outputDir) => {
    const baseName = getFileNameWithoutExtension(inputPath);
    const ext = outputFormat.startsWith('.') ? outputFormat : `.${outputFormat}`;
    return path.join(outputDir, `${baseName}_converted${ext}`);
};

const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const getFileSizeInMB = (filePath) => {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
};

const isFileExists = (filePath) => {
    return fs.existsSync(filePath);
};

module.exports = {
    getFileExtension,
    getFileNameWithoutExtension,
    generateOutputPath,
    deleteFile,
    ensureDirectoryExists,
    getFileSizeInMB,
    isFileExists
};
