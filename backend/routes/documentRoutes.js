const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

router.post('/convert', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat } = req.body;
        if (!outputFormat) {
            return res.status(400).json({ success: false, error: 'Output format is required' });
        }

        const result = await documentService.convertDocument(req.file.path, outputFormat);

        res.json({
            success: true,
            message: 'Document converted successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/docx-to-html', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await documentService.docxToHtml(req.file.path);

        res.json({
            success: true,
            message: 'Document converted to HTML',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/csv-to-json', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await documentService.csvToJson(req.file.path);

        res.json({
            success: true,
            message: 'CSV converted to JSON',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/json-to-csv', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await documentService.jsonToCsv(req.file.path);

        res.json({
            success: true,
            message: 'JSON converted to CSV',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/text-to-pdf', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await documentService.textToPdf(req.file.path);

        res.json({
            success: true,
            message: 'Text converted to PDF',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.get('/formats', (req, res) => {
    res.json({
        success: true,
        formats: config.allowedFormats.document,
        conversions: [
            { from: 'docx', to: ['pdf', 'html', 'txt'] },
            { from: 'pdf', to: ['docx', 'txt'] },
            { from: 'xlsx', to: ['pdf', 'csv'] },
            { from: 'csv', to: ['json', 'xlsx'] },
            { from: 'json', to: ['csv'] },
            { from: 'txt', to: ['pdf'] },
            { from: 'html', to: ['pdf'] },
            { from: 'md', to: ['pdf', 'html'] }
        ]
    });
});

module.exports = router;
