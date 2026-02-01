const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertImage = async (inputPath, outputFormat, options = {}) => {
    const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

    let pipeline = sharp(inputPath);

    if (options.width || options.height) {
        pipeline = pipeline.resize({
            width: options.width ? parseInt(options.width) : null,
            height: options.height ? parseInt(options.height) : null,
            fit: options.fit || 'inside',
            withoutEnlargement: true
        });
    }

    if (options.quality) {
        const quality = parseInt(options.quality);
        switch (outputFormat.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
                pipeline = pipeline.jpeg({ quality });
                break;
            case 'png':
                pipeline = pipeline.png({ quality });
                break;
            case 'webp':
                pipeline = pipeline.webp({ quality });
                break;
        }
    }

    switch (outputFormat.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
            pipeline = pipeline.jpeg(options.quality ? {} : { quality: 90 });
            break;
        case 'png':
            pipeline = pipeline.png();
            break;
        case 'webp':
            pipeline = pipeline.webp(options.quality ? {} : { quality: 85 });
            break;
        case 'gif':
            pipeline = pipeline.gif();
            break;
        case 'tiff':
            pipeline = pipeline.tiff();
            break;
        case 'bmp':
            pipeline = pipeline.bmp();
            break;
    }

    await pipeline.toFile(outputPath);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const compressImage = async (inputPath, quality = 70) => {
    const ext = path.extname(inputPath).toLowerCase().slice(1);
    const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

    let pipeline = sharp(inputPath);

    switch (ext) {
        case 'jpg':
        case 'jpeg':
            pipeline = pipeline.jpeg({ quality: parseInt(quality) });
            break;
        case 'png':
            pipeline = pipeline.png({ quality: parseInt(quality) });
            break;
        case 'webp':
            pipeline = pipeline.webp({ quality: parseInt(quality) });
            break;
        default:
            pipeline = pipeline.jpeg({ quality: parseInt(quality) });
    }

    await pipeline.toFile(outputPath);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const resizeImage = async (inputPath, width, height, fit = 'inside') => {
    const ext = path.extname(inputPath).toLowerCase().slice(1);
    const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

    await sharp(inputPath)
        .resize({
            width: width ? parseInt(width) : null,
            height: height ? parseInt(height) : null,
            fit: fit,
            withoutEnlargement: true
        })
        .toFile(outputPath);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const cropImage = async (inputPath, left, top, width, height) => {
    const ext = path.extname(inputPath).toLowerCase().slice(1);
    const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

    await sharp(inputPath)
        .extract({
            left: parseInt(left),
            top: parseInt(top),
            width: parseInt(width),
            height: parseInt(height)
        })
        .toFile(outputPath);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const getImageMetadata = async (inputPath) => {
    const metadata = await sharp(inputPath).metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha
    };
};

module.exports = {
    convertImage,
    compressImage,
    resizeImage,
    cropImage,
    getImageMetadata
};
