const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const createZip = (inputPaths, outputName) => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(config.convertedDir, `${outputName || 'archive'}_${Date.now()}.zip`);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            resolve({
                success: true,
                outputPath: outputPath,
                filename: path.basename(outputPath),
                size: archive.pointer()
            });
        });

        archive.on('error', (err) => {
            reject(new Error(`Archive creation failed: ${err.message}`));
        });

        archive.pipe(output);

        if (Array.isArray(inputPaths)) {
            inputPaths.forEach(filePath => {
                archive.file(filePath, { name: path.basename(filePath) });
            });
        } else {
            archive.file(inputPaths, { name: path.basename(inputPaths) });
        }

        archive.finalize();
    });
};

const createTar = (inputPaths, outputName) => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(config.convertedDir, `${outputName || 'archive'}_${Date.now()}.tar`);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('tar');

        output.on('close', () => {
            resolve({
                success: true,
                outputPath: outputPath,
                filename: path.basename(outputPath),
                size: archive.pointer()
            });
        });

        archive.on('error', (err) => {
            reject(new Error(`Archive creation failed: ${err.message}`));
        });

        archive.pipe(output);

        if (Array.isArray(inputPaths)) {
            inputPaths.forEach(filePath => {
                archive.file(filePath, { name: path.basename(filePath) });
            });
        } else {
            archive.file(inputPaths, { name: path.basename(inputPaths) });
        }

        archive.finalize();
    });
};

const extractArchive = async (inputPath) => {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    const extractDir = path.join(config.convertedDir, `${baseName}_extracted_${Date.now()}`);

    fs.mkdirSync(extractDir, { recursive: true });

    if (ext === '.zip') {
        const unzipper = require('unzipper');
        return new Promise((resolve, reject) => {
            fs.createReadStream(inputPath)
                .pipe(unzipper.Extract({ path: extractDir }))
                .on('close', () => {
                    resolve({
                        success: true,
                        outputPath: extractDir,
                        filename: path.basename(extractDir)
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Extraction failed: ${err.message}`));
                });
        });
    }

    return {
        success: false,
        error: `Unsupported archive format: ${ext}`
    };
};

const compressToFormat = async (inputPaths, format, outputName) => {
    switch (format.toLowerCase()) {
        case 'zip':
            return createZip(inputPaths, outputName);
        case 'tar':
            return createTar(inputPaths, outputName);
        default:
            throw new Error(`Unsupported archive format: ${format}`);
    }
};

module.exports = {
    createZip,
    createTar,
    extractArchive,
    compressToFormat
};
