const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertWithLibreOffice = (inputPath, outputFormat, outputDir) => {
    return new Promise((resolve, reject) => {
        const command = `"${config.libreOfficePath}" --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`LibreOffice conversion failed: ${error.message}`));
                return;
            }

            const baseName = path.basename(inputPath, path.extname(inputPath));
            const outputPath = path.join(outputDir, `${baseName}.${outputFormat}`);

            if (fs.existsSync(outputPath)) {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('Conversion completed but output file not found'));
            }
        });
    });
};

const docxToHtml = async (inputPath) => {
    const outputPath = generateOutputPath(inputPath, 'html', config.convertedDir);

    const result = await mammoth.convertToHtml({ path: inputPath });
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
${result.value}
</body>
</html>`;

    fs.writeFileSync(outputPath, htmlContent);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath),
        warnings: result.messages
    };
};

const docxToText = async (inputPath) => {
    const outputPath = generateOutputPath(inputPath, 'txt', config.convertedDir);

    const result = await mammoth.extractRawText({ path: inputPath });
    fs.writeFileSync(outputPath, result.value);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const textToPdf = async (inputPath) => {
    const outputPath = generateOutputPath(inputPath, 'pdf', config.convertedDir);
    const textContent = fs.readFileSync(inputPath, 'utf-8');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    const lines = textContent.split('\n');
    let yPosition = height - 50;

    for (const line of lines) {
        if (yPosition < 50) {
            const newPage = pdfDoc.addPage();
            yPosition = newPage.getSize().height - 50;
        }

        page.drawText(line.substring(0, 80), {
            x: 50,
            y: yPosition,
            size: fontSize
        });

        yPosition -= fontSize + 4;
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const htmlToPdf = async (inputPath) => {
    return convertWithLibreOffice(inputPath, 'pdf', config.convertedDir);
};

const csvToJson = async (inputPath) => {
    const outputPath = generateOutputPath(inputPath, 'json', config.convertedDir);
    const csvContent = fs.readFileSync(inputPath, 'utf-8');

    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const jsonData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });

    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const jsonToCsv = async (inputPath) => {
    const outputPath = generateOutputPath(inputPath, 'csv', config.convertedDir);
    const jsonContent = fs.readFileSync(inputPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('JSON must be an array of objects');
    }

    const headers = Object.keys(jsonData[0]);
    const csvLines = [headers.join(',')];

    jsonData.forEach(item => {
        const values = headers.map(header => {
            const value = item[header] || '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvLines.push(values.join(','));
    });

    fs.writeFileSync(outputPath, csvLines.join('\n'));

    return {
        success: true,
        outputPath: outputPath,
        filename: path.basename(outputPath)
    };
};

const convertDocument = async (inputPath, outputFormat) => {
    const inputExt = path.extname(inputPath).toLowerCase().slice(1);
    const targetFormat = outputFormat.toLowerCase();

    if (inputExt === 'docx' && targetFormat === 'html') {
        return docxToHtml(inputPath);
    }

    if (inputExt === 'docx' && targetFormat === 'txt') {
        return docxToText(inputPath);
    }

    if (inputExt === 'txt' && targetFormat === 'pdf') {
        return textToPdf(inputPath);
    }

    if (inputExt === 'csv' && targetFormat === 'json') {
        return csvToJson(inputPath);
    }

    if (inputExt === 'json' && targetFormat === 'csv') {
        return jsonToCsv(inputPath);
    }

    return convertWithLibreOffice(inputPath, targetFormat, config.convertedDir);
};

module.exports = {
    convertDocument,
    docxToHtml,
    docxToText,
    textToPdf,
    htmlToPdf,
    csvToJson,
    jsonToCsv,
    convertWithLibreOffice
};
