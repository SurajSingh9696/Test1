const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const archiveService = require('../services/archiveService');
const config = require('../config/config');

router.post('/create-zip', upload.array('files', 50), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const { archiveName } = req.body;
        const filePaths = req.files.map(f => f.path);

        const result = await archiveService.createZip(filePaths, archiveName);

        res.json({
            success: true,
            message: 'ZIP archive created successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`,
            size: result.size
        });
    } catch (error) {
        next(error);
    }
});

router.post('/create-tar', upload.array('files', 50), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const { archiveName } = req.body;
        const filePaths = req.files.map(f => f.path);

        const result = await archiveService.createTar(filePaths, archiveName);

        res.json({
            success: true,
            message: 'TAR archive created successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`,
            size: result.size
        });
    } catch (error) {
        next(error);
    }
});

router.post('/extract', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await archiveService.extractArchive(req.file.path);

        res.json({
            success: true,
            message: 'Archive extracted successfully',
            extractedTo: result.outputPath,
            filename: result.filename
        });
    } catch (error) {
        next(error);
    }
});

router.post('/compress', upload.array('files', 50), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const { format, archiveName } = req.body;
        if (!format) {
            return res.status(400).json({ success: false, error: 'Archive format is required' });
        }

        const filePaths = req.files.map(f => f.path);
        const result = await archiveService.compressToFormat(filePaths, format, archiveName);

        res.json({
            success: true,
            message: `${format.toUpperCase()} archive created successfully`,
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`,
            size: result.size
        });
    } catch (error) {
        next(error);
    }
});

router.get('/formats', (req, res) => {
    res.json({
        success: true,
        formats: config.allowedFormats.archive,
        operations: ['create-zip', 'create-tar', 'extract']
    });
});

module.exports = router;
