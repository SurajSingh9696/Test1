const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const audioService = require('../services/audioService');
const config = require('../config/config');

router.post('/convert', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat, bitrate, sampleRate, channels } = req.body;
        if (!outputFormat) {
            return res.status(400).json({ success: false, error: 'Output format is required' });
        }

        const options = {};
        if (bitrate) options.bitrate = bitrate;
        if (sampleRate) options.sampleRate = sampleRate;
        if (channels) options.channels = channels;

        const result = await audioService.convertAudio(req.file.path, outputFormat, options);

        res.json({
            success: true,
            message: 'Audio converted successfully',
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

        const result = await audioService.trimAudio(req.file.path, startTime, duration);

        res.json({
            success: true,
            message: 'Audio trimmed successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/merge', upload.array('files', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ success: false, error: 'At least 2 files are required for merging' });
        }

        const { outputFormat } = req.body;
        const filePaths = req.files.map(f => f.path);

        const result = await audioService.mergeAudio(filePaths, outputFormat || 'mp3');

        res.json({
            success: true,
            message: 'Audio files merged successfully',
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

        const metadata = await audioService.getAudioMetadata(req.file.path);

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
        formats: config.allowedFormats.audio,
        conversions: [
            { from: 'mp3', to: ['wav', 'aac', 'ogg', 'flac'] },
            { from: 'wav', to: ['mp3', 'aac', 'ogg', 'flac'] },
            { from: 'aac', to: ['mp3', 'wav', 'ogg'] },
            { from: 'ogg', to: ['mp3', 'wav', 'aac'] },
            { from: 'flac', to: ['mp3', 'wav', 'aac', 'ogg'] }
        ],
        bitrateOptions: ['64k', '128k', '192k', '256k', '320k'],
        sampleRateOptions: [22050, 44100, 48000, 96000]
    });
});

module.exports = router;
