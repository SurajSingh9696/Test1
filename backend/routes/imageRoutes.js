const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const imageService = require('../services/imageService');
const config = require('../config/config');

router.post('/convert', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat, width, height, quality, fit } = req.body;
        if (!outputFormat) {
            return res.status(400).json({ success: false, error: 'Output format is required' });
        }

        const options = {};
        if (width) options.width = width;
        if (height) options.height = height;
        if (quality) options.quality = quality;
        if (fit) options.fit = fit;

        const result = await imageService.convertImage(req.file.path, outputFormat, options);

        res.json({
            success: true,
            message: 'Image converted successfully',
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
        const result = await imageService.compressImage(req.file.path, quality || 70);

        res.json({
            success: true,
            message: 'Image compressed successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/resize', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { width, height, fit } = req.body;
        if (!width && !height) {
            return res.status(400).json({ success: false, error: 'Width or height is required' });
        }

        const result = await imageService.resizeImage(req.file.path, width, height, fit);

        res.json({
            success: true,
            message: 'Image resized successfully',
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

router.post('/crop', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { left, top, width, height } = req.body;
        if (!left || !top || !width || !height) {
            return res.status(400).json({ success: false, error: 'Crop dimensions are required (left, top, width, height)' });
        }

        const result = await imageService.cropImage(req.file.path, left, top, width, height);

        res.json({
            success: true,
            message: 'Image cropped successfully',
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

        const metadata = await imageService.getImageMetadata(req.file.path);

        res.json({
            success: true,
            metadata: metadata
        });
    } catch (error) {
        next(error);
    }
});

router.post('/batch', upload.array('files', 20), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const { outputFormat, quality } = req.body;
        if (!outputFormat) {
            return res.status(400).json({ success: false, error: 'Output format is required' });
        }

        const results = [];
        for (const file of req.files) {
            const result = await imageService.convertImage(file.path, outputFormat, { quality });
            results.push({
                originalName: file.originalname,
                filename: result.filename,
                downloadUrl: `/api/download/${result.filename}`
            });
        }

        res.json({
            success: true,
            message: `${results.length} images converted successfully`,
            files: results
        });
    } catch (error) {
        next(error);
    }
});

// PDF to Image conversion
router.post('/pdf-to-image', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { outputFormat, page } = req.body;
        const format = outputFormat || 'png';
        const options = page ? { page: parseInt(page) } : {};

        const result = await imageService.pdfToImage(req.file.path, format, options);

        res.json({
            success: true,
            message: 'PDF converted to image successfully',
            files: result.files,
            filename: result.filename,
            downloadUrl: `/api/download/${result.filename}`
        });
    } catch (error) {
        next(error);
    }
});

// Image to PDF conversion
router.post('/image-to-pdf', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const result = await imageService.imageToPdf(req.file.path);

        res.json({
            success: true,
            message: 'Image converted to PDF successfully',
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
        formats: config.allowedFormats.image,
        conversions: [
            { from: 'jpg', to: ['png', 'webp', 'gif', 'tiff', 'bmp'] },
            { from: 'png', to: ['jpg', 'webp', 'gif', 'tiff', 'bmp'] },
            { from: 'webp', to: ['jpg', 'png', 'gif'] },
            { from: 'gif', to: ['jpg', 'png', 'webp'] },
            { from: 'heic', to: ['jpg', 'png'] },
            { from: 'svg', to: ['png', 'jpg'] }
        ]
    });
});

module.exports = router;
