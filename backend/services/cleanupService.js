const fs = require('fs');
const path = require('path');
const config = require('../config/config');

let cleanupInterval = null;

const cleanOldFiles = (directory, maxAge) => {
    if (!fs.existsSync(directory)) {
        return;
    }

    const now = Date.now();
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            const fileAge = now - stats.mtimeMs;
            if (fileAge > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up: ${file}`);
            }
        } else if (stats.isDirectory()) {
            cleanOldFiles(filePath, maxAge);

            const remainingFiles = fs.readdirSync(filePath);
            if (remainingFiles.length === 0) {
                fs.rmdirSync(filePath);
                console.log(`Removed empty directory: ${file}`);
            }
        }
    });
};

const startCleanupService = () => {
    if (cleanupInterval) {
        return;
    }

    console.log('Starting cleanup service...');

    cleanupInterval = setInterval(() => {
        console.log('Running cleanup...');
        cleanOldFiles(config.uploadDir, config.fileRetentionTime);
        cleanOldFiles(config.convertedDir, config.fileRetentionTime);
    }, config.cleanupInterval);

    cleanOldFiles(config.uploadDir, config.fileRetentionTime);
    cleanOldFiles(config.convertedDir, config.fileRetentionTime);
};

const stopCleanupService = () => {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
        console.log('Cleanup service stopped');
    }
};

const cleanupFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    startCleanupService,
    stopCleanupService,
    cleanOldFiles,
    cleanupFile
};
