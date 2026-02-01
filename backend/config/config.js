const path = require('path');

const config = {
    port: process.env.PORT || 5000,
    uploadDir: path.join(__dirname, '..', 'uploads'),
    convertedDir: path.join(__dirname, '..', 'converted'),
    maxFileSize: 100 * 1024 * 1024,
    cleanupInterval: 30 * 60 * 1000,
    fileRetentionTime: 60 * 60 * 1000,
    allowedFormats: {
        document: ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.html', '.txt', '.md', '.epub', '.csv', '.json'],
        image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg', '.heic', '.heif'],
        audio: ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.wma'],
        video: ['.mp4', '.mkv', '.avi', '.webm', '.mov', '.wmv', '.flv', '.m4v'],
        archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
    },
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
    libreOfficePath: process.env.LIBREOFFICE_PATH || 'soffice'
};

module.exports = config;
