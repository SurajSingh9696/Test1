import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from '../components/Common/FileUploader'
import ProgressBar from '../components/Common/ProgressBar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { documentAPI, downloadFile } from '../services/api'
import { useConversion } from '../context/ConversionContext'
import { showConversionSuccess, showConversionError } from '../utils/toast'
import './ConverterPage.css'

function DocumentPage() {
    const [files, setFiles] = useState([])
    const [outputFormat, setOutputFormat] = useState('pdf')
    const [isConverting, setIsConverting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const { addConversion, updateConversion } = useConversion()

    const formatOptions = [
        { value: 'pdf', label: 'PDF' },
        { value: 'docx', label: 'DOCX' },
        { value: 'xlsx', label: 'Excel (XLSX)' },
        { value: 'pptx', label: 'PowerPoint' },
        { value: 'html', label: 'HTML' },
        { value: 'txt', label: 'Plain Text' },
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' }
    ]

    const handleFilesSelected = (selectedFiles) => {
        setFiles(selectedFiles)
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
            type: 'document',
            outputFormat,
            status: 'processing'
        })

        // Simulated processing progress (50% to 90%)
        let processingInterval = null
        const startProcessingProgress = () => {
            let currentProgress = 50
            processingInterval = setInterval(() => {
                currentProgress += 2
                if (currentProgress >= 90) {
                    clearInterval(processingInterval)
                    currentProgress = 90
                }
                setProgress(currentProgress)
            }, 200)
        }

        try {
            // Track upload progress (0-50%)
            const onProgress = (uploadPercent) => {
                const uploadProgress = Math.round(uploadPercent * 0.5)
                setProgress(uploadProgress)
                if (uploadPercent >= 100 && !processingInterval) {
                    startProcessingProgress()
                }
            }

            setProgress(1)
            const response = await documentAPI.convert(files[0], outputFormat, onProgress)

            if (processingInterval) clearInterval(processingInterval)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })

            updateConversion(conversionId, { status: 'success', filename: response.data.filename })
            showConversionSuccess(response.data.filename)
        } catch (err) {
            if (processingInterval) clearInterval(processingInterval)
            setError(err.message)
            updateConversion(conversionId, { status: 'error' })
            showConversionError(err)
        } finally {
            setIsConverting(false)
        }
    }

    const handleReset = () => {
        setFiles([])
        setResult(null)
        setError(null)
        setProgress(0)
    }

    return (
        <div className="converter-page">
            <div className="container">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-icon document-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h1 className="page-title">Document Converter</h1>
                    <p className="page-subtitle">Convert documents between PDF, Word, Excel, and more</p>
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
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.html,.md"
                                    />

                                    {files.length > 0 && (
                                        <motion.div
                                            className="selected-files"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <h3>Selected File</h3>
                                            <div className="file-item">
                                                <div className="file-info">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14,2 14,8 20,8" />
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
                                    <p>Your file has been converted successfully</p>
                                    <div className="result-actions">
                                        <a href={result.downloadUrl} className="btn btn-primary btn-lg" download>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7,10 12,15 17,10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download {result.filename}
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
                            <h3>Output Format</h3>
                            <div className="format-grid">
                                {formatOptions.map((format) => (
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

                        <button
                            className="btn btn-primary btn-lg w-full convert-btn"
                            onClick={handleConvert}
                            disabled={files.length === 0 || isConverting}
                        >
                            {isConverting ? 'Converting...' : 'Convert Now'}
                        </button>

                        <div className="sidebar-card info-card">
                            <h4>Supported Conversions</h4>
                            <ul>
                                <li>PDF ↔ DOCX, XLSX, PPTX</li>
                                <li>DOCX ↔ PDF, HTML, TXT</li>
                                <li>CSV ↔ JSON, Excel</li>
                                <li>HTML ↔ PDF</li>
                                <li>Markdown → PDF, HTML</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocumentPage
