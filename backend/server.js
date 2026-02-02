const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const { startCleanupService } = require('./services/cleanupService');

const documentRoutes = require('./routes/documentRoutes');
const imageRoutes = require('./routes/imageRoutes');
const audioRoutes = require('./routes/audioRoutes');
const videoRoutes = require('./routes/videoRoutes');
const archiveRoutes = require('./routes/archiveRoutes');

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://uniconvert-frontend.onrender.com'
        ];

        // Also allow any .onrender.com subdomain
        if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
}
if (!fs.existsSync(config.convertedDir)) {
    fs.mkdirSync(config.convertedDir, { recursive: true });
}

app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/archives', archiveRoutes);

app.get('/api/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(config.convertedDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.download(filePath, filename);
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Universal Converter API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/formats', (req, res) => {
    res.json({
        success: true,
        formats: config.allowedFormats
    });
});

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Universal Converter API running on port ${PORT}`);
    startCleanupService();
});

module.exports = app;
