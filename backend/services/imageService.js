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

// PDF to Image conversion using Python pdf2image
const pdfToImage = async (inputPath, outputFormat = 'png', options = {}) => {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    const outputDir = config.convertedDir;
    const scriptPath = path.join(__dirname, '..', 'scripts', 'pdf_to_image.py');

    const pageArg = options.page ? options.page.toString() : '';
    const command = `python3 "${scriptPath}" "${inputPath}" "${outputDir}" "${outputFormat}" ${pageArg}`.trim();

    console.log(`[pdfToImage] Running: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command, { timeout: 600000 });

        console.log(`[pdfToImage] stdout: ${stdout}`);
        if (stderr) console.log(`[pdfToImage] stderr: ${stderr}`);

        // Parse the output files from stdout
        const outputLines = stdout.split('\n').filter(line => line.startsWith('OUTPUT:'));
        const files = outputLines.map(line => {
            const filePath = line.replace('OUTPUT:', '').trim();
            return {
                outputPath: filePath,
                filename: path.basename(filePath)
            };
        });

        if (files.length === 0) {
            throw new Error('PDF to image conversion produced no output');
        }

        return {
            success: true,
            files: files,
            outputPath: files[0].outputPath,
            filename: files[0].filename
        };
    } catch (error) {
        console.error(`[pdfToImage] Error: ${error.message}`);
        throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
};

// Image to PDF conversion (supports multiple images)
const imageToPdf = async (inputPaths) => {
    const { PDFDocument } = require('pdf-lib');

    // Support both single path and array of paths
    const paths = Array.isArray(inputPaths) ? inputPaths : [inputPaths];
    const outputPath = generateOutputPath(paths[0], 'pdf', config.convertedDir);

    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        for (const inputPath of paths) {
            // Read the image
            const imageBuffer = fs.readFileSync(inputPath);
            const ext = path.extname(inputPath).toLowerCase();

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
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        return {
            success: true,
            outputPath: outputPath,
            filename: path.basename(outputPath),
            pages: paths.length
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
