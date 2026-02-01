const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const videoService = require('../services/videoService');
const config = require('../config/config');

router.post('/convert', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat, resolution, videoBitrate, audioBitrate, fps } = req.body;
        if (!outputFormat) {
            return res.status(400).json({ success: false, error: 'Output format is required' });
        }

        const options = {};
        if (resolution) options.resolution = resolution;
        if (videoBitrate) options.videoBitrate = videoBitrate;
        if (audioBitrate) options.audioBitrate = audioBitrate;
        if (fps) options.fps = fps;

        const result = await videoService.convertVideo(req.file.path, outputFormat, options);

        res.json({
            success: true,
            message: 'Video converted successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/compress', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { quality } = req.body;
        const result = await videoService.compressVideo(req.file.path, quality || 'medium');

        res.json({
            success: true,
            message: 'Video compressed successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/trim', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { startTime, duration } = req.body;
        if (!startTime || !duration) {
            return res.status(400).json({ success: false, error: 'Start time and duration are required' });
        }

        const result = await videoService.trimVideo(req.file.path, startTime, duration);

        res.json({
            success: true,
            message: 'Video trimmed successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/extract-audio', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat } = req.body;
        const result = await videoService.extractAudio(req.file.path, outputFormat || 'mp3');

        res.json({
            success: true,
            message: 'Audio extracted successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/change-resolution', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { resolution } = req.body;
        if (!resolution) {
            return res.status(400).json({ success: false, error: 'Resolution is required' });
        }

        const result = await videoService.changeResolution(req.file.path, resolution);

        res.json({
            success: true,
            message: 'Resolution changed successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/metadata', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const metadata = await videoService.getVideoMetadata(req.file.path);

        res.json({
            success: true,
            metadata: metadata
        });
    } catch (error) {
        next(error);
    }
});

router.get('/formats', (req, res) => {
    res.json({
        success: true,
        formats: config.allowedFormats.video,
        conversions: [
            { from: 'mp4', to: ['mkv', 'avi', 'webm', 'mov'] },
            { from: 'mkv', to: ['mp4', 'avi', 'webm'] },
            { from: 'avi', to: ['mp4', 'mkv', 'webm'] },
            { from: 'webm', to: ['mp4', 'mkv', 'avi'] },
            { from: 'mov', to: ['mp4', 'mkv', 'avi'] }
        ],
        resolutions: ['4k', '1080p', '720p', '480p', '360p'],
        qualityOptions: ['low', 'medium', 'high']
    });
});

module.exports = router;
