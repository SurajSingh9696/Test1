import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from '../components/Common/FileUploader'
import ProgressBar from '../components/Common/ProgressBar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { imageAPI, downloadFile } from '../services/api'
import { useConversion } from '../context/ConversionContext'
import './ConverterPage.css'

function ImagePage() {
    const [files, setFiles] = useState([])
    const [outputFormat, setOutputFormat] = useState('png')
    const [options, setOptions] = useState({ width: '', height: '', quality: 85 })
    const [isConverting, setIsConverting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const { addConversion, updateConversion } = useConversion()
    const [conversionMode, setConversionMode] = useState('image') // 'image', 'pdfToImage', 'imageToPdf'

    const formatOptions = [
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WEBP' },
        { value: 'gif', label: 'GIF' },
        { value: 'tiff', label: 'TIFF' },
        { value: 'bmp', label: 'BMP' }
    ]

    const pdfOutputFormats = [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' }
    ]

    const handleFilesSelected = (selectedFiles) => {
        // For image-to-PDF, allow adding multiple files; otherwise replace
        if (conversionMode === 'imageToPdf') {
            setFiles(prev => [...prev, ...selectedFiles])
        } else {
            setFiles(selectedFiles)
        }
        setResult(null)
        setError(null)
    }

    const handleConvert = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResult(null)

        const conversionId = addConversion({
            originalName: files[0].name,
            type: 'image',
            outputFormat,
            status: 'processing'
        })

        try {
            setProgress(30)
            const response = await imageAPI.convert(files[0], outputFormat, options)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })

            updateConversion(conversionId, { status: 'success' })
        } catch (err) {
            setError(err.message)
            updateConversion(conversionId, { status: 'error' })
        } finally {
            setIsConverting(false)
        }
    }

    const handleCompress = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResult(null)

        try {
            setProgress(30)
            const response = await imageAPI.compress(files[0], options.quality)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setIsConverting(false)
        }
    }

    const handlePdfToImage = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResult(null)

        const conversionId = addConversion({
            originalName: files[0].name,
            type: 'pdf-to-image',
            outputFormat,
            status: 'processing'
        })

        try {
            setProgress(30)
            const response = await imageAPI.pdfToImage(files[0], outputFormat)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename),
                isZip: response.data.isZip,
                pageCount: response.data.pageCount,
                message: response.data.message
            })

            updateConversion(conversionId, { status: 'success' })
        } catch (err) {
            setError(err.message)
            updateConversion(conversionId, { status: 'error' })
        } finally {
            setIsConverting(false)
        }
    }

    const handleImageToPdf = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResult(null)

        const conversionId = addConversion({
            originalName: files.length === 1 ? files[0].name : `${files.length} images`,
            type: 'image-to-pdf',
            outputFormat: 'pdf',
            status: 'processing'
        })

        try {
            setProgress(30)
            const response = await imageAPI.imageToPdf(files)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })

            updateConversion(conversionId, { status: 'success' })
        } catch (err) {
            setError(err.message)
            updateConversion(conversionId, { status: 'error' })
        } finally {
            setIsConverting(false)
        }
    }

    const handleReset = () => {
        setFiles([])
        setResult(null)
        setError(null)
        setProgress(0)
        setConversionMode('image')
    }

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getAcceptTypes = () => {
        if (conversionMode === 'pdfToImage') return '.pdf'
        return 'image/*,.heic,.heif'
    }

    return (
        <div className="converter-page">
            <div className="container">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-icon image-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                    </div>
                    <h1 className="page-title">Image Converter</h1>
                    <p className="page-subtitle">Convert, resize, and compress images in any format</p>
                </motion.div>

                <div className="converter-content">
                    <div className="converter-main">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="uploader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <FileUploader
                                        onFilesSelected={handleFilesSelected}
                                        accept={getAcceptTypes()}
                                        multiple={conversionMode === 'imageToPdf'}
                                    />

                                    {files.length > 0 && (
                                        <motion.div
                                            className="selected-files"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <h3>{conversionMode === 'imageToPdf' ? `Selected Images (${files.length})` : 'Selected File'}</h3>
                                            {conversionMode === 'imageToPdf' ? (
                                                // Show all files for image-to-PDF mode
                                                <div className="files-list">
                                                    {files.map((file, index) => (
                                                        <div className="file-item" key={index}>
                                                            <div className="file-info">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                                </svg>
                                                                <span className="file-name">{file.name}</span>
                                                                <span className="file-size">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </span>
                                                            </div>
                                                            <button className="remove-file" onClick={() => removeFile(index)}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                // Show single file for other modes
                                                <div className="file-item">
                                                    <div className="file-info">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                                        </svg>
                                                        <span className="file-name">{files[0].name}</span>
                                                        <span className="file-size">
                                                            {(files[0].size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                    <button className="remove-file" onClick={() => setFiles([])}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    className="result-section"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="result-icon success">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                    </div>
                                    <h3>Conversion Complete!</h3>
                                    <p>{result.message || (result.isZip
                                        ? `${result.pageCount} pages converted to images (ZIP archive)`
                                        : 'Your file has been processed successfully')}</p>
                                    <div className="result-actions">
                                        <a href={result.downloadUrl} className="btn btn-primary btn-lg" download>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7,10 12,15 17,10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            {result.isZip ? 'Download ZIP' : 'Download'}
                                        </a>
                                        <button className="btn btn-secondary" onClick={handleReset}>
                                            Convert Another
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isConverting && (
                            <motion.div
                                className="converting-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <LoadingSpinner size="lg" />
                                <ProgressBar progress={progress} status="processing" />
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                {error}
                            </motion.div>
                        )}
                    </div>

                    <div className="converter-sidebar">
                        <div className="sidebar-card">
                            <h3>Conversion Type</h3>
                            <div className="format-grid">
                                <button
                                    className={`format-option ${conversionMode === 'image' ? 'active' : ''}`}
                                    onClick={() => { setConversionMode('image'); setFiles([]); }}
                                >
                                    Image → Image
                                </button>
                                <button
                                    className={`format-option ${conversionMode === 'pdfToImage' ? 'active' : ''}`}
                                    onClick={() => { setConversionMode('pdfToImage'); setFiles([]); }}
                                >
                                    PDF → Image
                                </button>
                                <button
                                    className={`format-option ${conversionMode === 'imageToPdf' ? 'active' : ''}`}
                                    onClick={() => { setConversionMode('imageToPdf'); setFiles([]); }}
                                >
                                    Image → PDF
                                </button>
                            </div>
                        </div>

                        {conversionMode !== 'imageToPdf' && (
                            <div className="sidebar-card">
                                <h3>Output Format</h3>
                                <div className="format-grid">
                                    {(conversionMode === 'pdfToImage' ? pdfOutputFormats : formatOptions).map((format) => (
                                        <button
                                            key={format.value}
                                            className={`format-option ${outputFormat === format.value ? 'active' : ''}`}
                                            onClick={() => setOutputFormat(format.value)}
                                        >
                                            {format.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="sidebar-card">
                            <h3>Options</h3>
                            <div className="option-row">
                                <label>Width (px)</label>
                                <input
                                    type="number"
                                    placeholder="Auto"
                                    value={options.width}
                                    onChange={(e) => setOptions({ ...options, width: e.target.value })}
                                />
                            </div>
                            <div className="option-row">
                                <label>Height (px)</label>
                                <input
                                    type="number"
                                    placeholder="Auto"
                                    value={options.height}
                                    onChange={(e) => setOptions({ ...options, height: e.target.value })}
                                />
                            </div>
                            <div className="option-row">
                                <label>Quality ({options.quality}%)</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={options.quality}
                                    onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="action-buttons">
                            {conversionMode === 'image' && (
                                <>
                                    <button
                                        className="btn btn-primary btn-lg w-full convert-btn"
                                        onClick={handleConvert}
                                        disabled={files.length === 0 || isConverting}
                                    >
                                        {isConverting ? 'Converting...' : 'Convert Image'}
                                    </button>
                                    <button
                                        className="btn btn-secondary w-full"
                                        onClick={handleCompress}
                                        disabled={files.length === 0 || isConverting}
                                    >
                                        Compress Only
                                    </button>
                                </>
                            )}
                            {conversionMode === 'pdfToImage' && (
                                <button
                                    className="btn btn-primary btn-lg w-full convert-btn"
                                    onClick={handlePdfToImage}
                                    disabled={files.length === 0 || isConverting}
                                >
                                    {isConverting ? 'Converting...' : 'Convert PDF to Image'}
                                </button>
                            )}
                            {conversionMode === 'imageToPdf' && (
                                <button
                                    className="btn btn-primary btn-lg w-full convert-btn"
                                    onClick={handleImageToPdf}
                                    disabled={files.length === 0 || isConverting}
                                >
                                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImagePage
