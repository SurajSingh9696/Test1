const errorHandler = (err, req, res, next) => {
    console.error('Conversion Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: req.path
    });

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            error: 'File size exceeds the maximum limit of 100MB',
            code: 'FILE_TOO_LARGE'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            error: 'Too many files uploaded',
            code: 'TOO_MANY_FILES'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'Unexpected file field',
            code: 'UNEXPECTED_FILE'
        });
    }

    if (err.message && err.message.includes('not supported')) {
        return res.status(400).json({
            success: false,
            error: err.message,
            code: 'UNSUPPORTED_FORMAT'
        });
    }

    if (err.message && err.message.includes('FFmpeg')) {
        return res.status(500).json({
            success: false,
            error: 'FFmpeg is not installed or not available. Please install FFmpeg for audio/video conversions.',
            code: 'FFMPEG_NOT_FOUND'
        });
    }

    if (err.message && err.message.includes('LibreOffice')) {
        return res.status(500).json({
            success: false,
            error: 'LibreOffice is not installed. Some document conversions may not be available.',
            code: 'LIBREOFFICE_NOT_FOUND'
        });
    }

    if (err.code === 'ENOENT') {
        return res.status(404).json({
            success: false,
            error: 'File not found or has been deleted',
            code: 'FILE_NOT_FOUND'
        });
    }

    if (err.code === 'EACCES') {
        return res.status(500).json({
            success: false,
            error: 'Permission denied while processing file',
            code: 'PERMISSION_DENIED'
        });
    }

    if (err.code === 'ENOMEM') {
        return res.status(500).json({
            success: false,
            error: 'Out of memory. File may be too large to process.',
            code: 'OUT_OF_MEMORY'
        });
    }

    if (err.message && err.message.includes('timeout')) {
        return res.status(408).json({
            success: false,
            error: 'Conversion timed out. Please try a smaller file.',
            code: 'CONVERSION_TIMEOUT'
        });
    }

    if (err.message && err.message.includes('corrupt')) {
        return res.status(400).json({
            success: false,
            error: 'File appears to be corrupted or invalid',
            code: 'CORRUPTED_FILE'
        });
    }

    return res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred during conversion',
        code: 'UNKNOWN_ERROR'
    });
};

module.exports = errorHandler;
