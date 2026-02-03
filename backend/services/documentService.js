const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertWithLibreOffice = (inputPath, outputFormat, outputDir) => {
    return new Promise((resolve, reject) => {
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const command = `"${config.libreOfficePath}" --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`;

        console.log(`[LibreOffice] Running: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`[LibreOffice] Error: ${error.message}`);
                console.error(`[LibreOffice] stderr: ${stderr}`);
                reject(new Error(`LibreOffice conversion failed: ${error.message}`));
                return;
            }

            console.log(`[LibreOffice] stdout: ${stdout}`);
            if (stderr) console.log(`[LibreOffice] stderr: ${stderr}`);

            // Try to find the output file - LibreOffice might use slightly different names
            const possibleExtensions = [outputFormat, outputFormat.toLowerCase()];
            let outputPath = null;

            for (const ext of possibleExtensions) {
                const tryPath = path.join(outputDir, `${baseName}.${ext}`);
                if (fs.existsSync(tryPath)) {
                    outputPath = tryPath;
                    break;
                }
            }

            // If still not found, try to find any file that starts with the base name
            if (!outputPath) {
                try {
                    const files = fs.readdirSync(outputDir);
                    const matchingFiles = files.filter(f =>
                        f.startsWith(baseName) &&
                        f.toLowerCase().endsWith(`.${outputFormat.toLowerCase()}`)
                    );

                    if (matchingFiles.length > 0) {
                        outputPath = path.join(outputDir, matchingFiles[0]);
                    }
                } catch (dirError) {
                    console.error(`[LibreOffice] Error reading output dir: ${dirError.message}`);
                }
            }

            if (outputPath && fs.existsSync(outputPath)) {
                console.log(`[LibreOffice] Output file found: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                console.error(`[LibreOffice] Output file not found. Expected: ${baseName}.${outputFormat}`);
                console.error(`[LibreOffice] Files in output dir:`, fs.readdirSync(outputDir).slice(0, 10));
                reject(new Error(`Conversion completed but output file not found. LibreOffice may not support this conversion (${path.extname(inputPath)} to ${outputFormat}).`));
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

    // Special handling for HTML to DOCX using Python
    if ((inputExt === 'html' || inputExt === 'htm') && targetFormat === 'docx') {
        return htmlToDocx(inputPath);
    }

    if (inputExt === 'csv' && targetFormat === 'json') {
        return csvToJson(inputPath);
    }

    if (inputExt === 'json' && targetFormat === 'csv') {
        return jsonToCsv(inputPath);
    }

    // Special handling for PDF to DOCX/DOC using Python
    if (inputExt === 'pdf' && (targetFormat === 'docx' || targetFormat === 'doc')) {
        return pdfToDocx(inputPath);
    }

    // Special handling for PDF to XLSX/CSV using Python tabula
    if (inputExt === 'pdf' && (targetFormat === 'xlsx' || targetFormat === 'csv' || targetFormat === 'xls')) {
        return pdfToExcel(inputPath, targetFormat === 'xls' ? 'xlsx' : targetFormat);
    }

    // Special handling for DOCX/TXT/HTML to PDF using Python (no LibreOffice needed)
    if ((inputExt === 'docx' || inputExt === 'txt' || inputExt === 'html' || inputExt === 'htm') && targetFormat === 'pdf') {
        return docToPdf(inputPath);
    }

    // Special handling for PDF to PPTX/PPT using Python
    if (inputExt === 'pdf' && (targetFormat === 'pptx' || targetFormat === 'ppt')) {
        return pdfToPpt(inputPath);
    }

    // Fallback to LibreOffice for other conversions
    // Note: LibreOffice may not work properly in some Docker environments
    return convertWithLibreOffice(inputPath, targetFormat, config.convertedDir);
};

// PDF to PowerPoint using Python
const pdfToPpt = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, 'pptx', config.convertedDir);
        const scriptPath = path.join(__dirname, '..', 'scripts', 'pdf_to_ppt.py');
        const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`;

        console.log(`[pdfToPpt] Running: ${command}`);

        exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[pdfToPpt] Error: ${error.message}`);
                console.error(`[pdfToPpt] stderr: ${stderr}`);
                reject(new Error(`PDF to PowerPoint conversion failed: ${error.message}`));
                return;
            }

            console.log(`[pdfToPpt] stdout: ${stdout}`);
            if (stderr) console.log(`[pdfToPpt] stderr: ${stderr}`);

            if (fs.existsSync(outputPath)) {
                console.log(`[pdfToPpt] Output file created: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('PDF to PowerPoint conversion completed but output file not found'));
            }
        });
    });
};

// HTML to DOCX using Python (beautifulsoup4 + python-docx)
const htmlToDocx = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, 'docx', config.convertedDir);
        const scriptPath = path.join(__dirname, '..', 'scripts', 'html_to_docx.py');
        const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`;

        console.log(`[htmlToDocx] Running: ${command}`);

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[htmlToDocx] Error: ${error.message}`);
                console.error(`[htmlToDocx] stderr: ${stderr}`);
                reject(new Error(`HTML to DOCX conversion failed: ${error.message}`));
                return;
            }

            console.log(`[htmlToDocx] stdout: ${stdout}`);
            if (stderr) console.log(`[htmlToDocx] stderr: ${stderr}`);

            if (fs.existsSync(outputPath)) {
                console.log(`[htmlToDocx] Output file created: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('HTML to DOCX conversion completed but output file not found'));
            }
        });
    });
};

// Document to PDF using Python (python-docx + reportlab)
const docToPdf = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, 'pdf', config.convertedDir);
        const scriptPath = path.join(__dirname, '..', 'scripts', 'doc_to_pdf.py');
        const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`;

        console.log(`[docToPdf] Running: ${command}`);

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[docToPdf] Error: ${error.message}`);
                console.error(`[docToPdf] stderr: ${stderr}`);
                reject(new Error(`Document to PDF conversion failed: ${error.message}`));
                return;
            }

            console.log(`[docToPdf] stdout: ${stdout}`);
            if (stderr) console.log(`[docToPdf] stderr: ${stderr}`);

            if (fs.existsSync(outputPath)) {
                console.log(`[docToPdf] Output file created: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('Document to PDF conversion completed but output file not found'));
            }
        });
    });
};

// PDF to Excel/CSV using Python tabula-py library
const pdfToExcel = (inputPath, outputFormat = 'xlsx') => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);
        const scriptPath = path.join(__dirname, '..', 'scripts', 'pdf_to_excel.py');
        const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`;

        console.log(`[tabula] Running: ${command}`);

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[tabula] Error: ${error.message}`);
                console.error(`[tabula] stderr: ${stderr}`);
                reject(new Error(`PDF to Excel conversion failed: ${error.message}`));
                return;
            }

            console.log(`[tabula] stdout: ${stdout}`);
            if (stderr) console.log(`[tabula] stderr: ${stderr}`);

            if (fs.existsSync(outputPath)) {
                console.log(`[tabula] Output file created: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('PDF to Excel conversion completed but output file not found'));
            }
        });
    });
};

// PDF to DOCX using Python pdf2docx library
const pdfToDocx = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, 'docx', config.convertedDir);
        const scriptPath = path.join(__dirname, '..', 'scripts', 'pdf_to_docx.py');
        const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`;

        console.log(`[pdf2docx] Running: ${command}`);

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[pdf2docx] Error: ${error.message}`);
                console.error(`[pdf2docx] stderr: ${stderr}`);
                reject(new Error(`PDF to DOCX conversion failed: ${error.message}`));
                return;
            }

            console.log(`[pdf2docx] stdout: ${stdout}`);
            if (stderr) console.log(`[pdf2docx] stderr: ${stderr}`);

            if (fs.existsSync(outputPath)) {
                console.log(`[pdf2docx] Output file created: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            } else {
                reject(new Error('PDF to DOCX conversion completed but output file not found'));
            }
        });
    });
};

module.exports = {
    convertDocument,
    docxToHtml,
    docxToText,
    textToPdf,
    htmlToPdf,
    csvToJson,
    jsonToCsv,
    pdfToDocx,
    convertWithLibreOffice
};
