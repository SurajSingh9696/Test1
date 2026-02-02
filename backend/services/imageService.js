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

// PDF to Image conversion
const pdfToImage = async (inputPath, outputFormat = 'png', options = {}) => {
    const pdf = require('pdf-poppler');
    const outputDir = config.convertedDir;
    const baseName = path.basename(inputPath, path.extname(inputPath));

    const pdfOptions = {
        format: outputFormat.toLowerCase() === 'jpg' ? 'jpeg' : outputFormat.toLowerCase(),
        out_dir: outputDir,
        out_prefix: `${baseName}_${Date.now()}`,
        page: options.page || null // null means all pages
    };

    try {
        await pdf.convert(inputPath, pdfOptions);

        // Find the generated files
        const files = fs.readdirSync(outputDir)
            .filter(f => f.startsWith(pdfOptions.out_prefix))
            .map(f => path.join(outputDir, f));

        if (files.length === 0) {
            throw new Error('PDF conversion produced no output');
        }

        // Return the first page or all pages
        return {
            success: true,
            files: files.map(f => ({
                outputPath: f,
                filename: path.basename(f)
            })),
            filename: path.basename(files[0])
        };
    } catch (error) {
        throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
};

// Image to PDF conversion
const imageToPdf = async (inputPath) => {
    const { PDFDocument } = require('pdf-lib');
    const outputPath = generateOutputPath(inputPath, 'pdf', config.convertedDir);

    try {
        // Read the image
        const imageBuffer = fs.readFileSync(inputPath);
        const ext = path.extname(inputPath).toLowerCase();

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Embed the image based on format
        let image;
        if (ext === '.jpg' || ext === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBuffer);
        } else if (ext === '.png') {
            image = await pdfDoc.embedPng(imageBuffer);
        } else {
            // For other formats, convert to PNG first using sharp
            const pngBuffer = await sharp(inputPath).png().toBuffer();
            image = await pdfDoc.embedPng(pngBuffer);
        }

        // Get image dimensions
        const { width, height } = image.scale(1);

        // Add a page with the image dimensions
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: width,
            height: height
        });

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        return {
            success: true,
            outputPath: outputPath,
            filename: path.basename(outputPath)
        };
    } catch (error) {
        throw new Error(`Image to PDF conversion failed: ${error.message}`);
    }
};

module.exports = {
    convertImage,
    compressImage,
    resizeImage,
    cropImage,
    getImageMetadata,
    pdfToImage,
    imageToPdf
};
