import { useState } from 'react'
import { motion } from 'framer-motion'
import FileUploader from '../components/Common/FileUploader'
import ProgressBar from '../components/Common/ProgressBar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { imageAPI, downloadFile } from '../services/api'
import './BatchConverter.css'

function BatchConverter() {
    const [files, setFiles] = useState([])
    const [outputFormat, setOutputFormat] = useState('png')
    const [conversionType, setConversionType] = useState('image')
    const [isConverting, setIsConverting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)

    const typeOptions = [
        { value: 'image', label: 'Images' },
        { value: 'document', label: 'Documents' }
    ]

    const formatsByType = {
        image: [
            { value: 'jpg', label: 'JPG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WEBP' }
        ],
        document: [
            { value: 'pdf', label: 'PDF' },
            { value: 'docx', label: 'DOCX' }
        ]
    }

    const handleFilesSelected = (selectedFiles) => {
        setFiles(prev => [...prev, ...selectedFiles])
        setResults([])
        setError(null)
    }

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleConvert = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResults([])

        try {
            if (conversionType === 'image') {
                const response = await imageAPI.batch(files, outputFormat)
                setProgress(100)
                setResults(response.data.files.map(f => ({
                    ...f,
                    downloadUrl: downloadFile(f.filename)
                })))
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setIsConverting(false)
        }
    }

    const handleReset = () => {
        setFiles([])
        setResults([])
        setError(null)
        setProgress(0)
    }

    return (
        <div className="batch-converter">
            <div className="container">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-icon batch-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                            <path d="M12 12h.01" />
                            <path d="M17 12h.01" />
                            <path d="M7 12h.01" />
                        </svg>
                    </div>
                    <h1 className="page-title">Batch Converter</h1>
                    <p className="page-subtitle">Convert multiple files at once</p>
                </motion.div>

                <div className="batch-content">
                    <div className="batch-settings">
                        <div className="setting-group">
                            <label>Conversion Type</label>
                            <div className="type-options">
                                {typeOptions.map((type) => (
                                    <button
                                        key={type.value}
                                        className={`type-option ${conversionType === type.value ? 'active' : ''}`}
                                        onClick={() => {
                                            setConversionType(type.value)
                                            setOutputFormat(formatsByType[type.value][0].value)
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <label>Output Format</label>
                            <div className="format-options">
                                {formatsByType[conversionType].map((format) => (
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
                    </div>

                    {results.length === 0 ? (
                        <>
                            <FileUploader
                                onFilesSelected={handleFilesSelected}
                                accept={conversionType === 'image' ? 'image/*' : '.pdf,.docx,.doc,.xlsx,.pptx'}
                                multiple={true}
                                maxFiles={20}
                            />

                            {files.length > 0 && (
                                <motion.div
                                    className="files-list"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="files-header">
                                        <h3>{files.length} Files Selected</h3>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setFiles([])}>
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="files-grid">
                                        {files.map((file, index) => (
                                            <div key={index} className="file-card">
                                                <div className="file-info">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                </div>
                                                <button className="remove-btn" onClick={() => removeFile(index)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-primary btn-lg convert-all-btn"
                                        onClick={handleConvert}
                                        disabled={isConverting}
                                    >
                                        {isConverting ? 'Converting...' : `Convert All ${files.length} Files`}
                                    </button>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            className="results-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="results-header">
                                <div className="result-icon success">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20,6 9,17 4,12" />
                                    </svg>
                                </div>
                                <h3>{results.length} Files Converted!</h3>
                            </div>
                            <div className="results-grid">
                                {results.map((result, index) => (
                                    <div key={index} className="result-card">
                                        <div className="result-info">
                                            <span className="result-original">{result.originalName}</span>
                                            <span className="result-converted">{result.filename}</span>
                                        </div>
                                        <a href={result.downloadUrl} className="btn btn-primary btn-sm" download>
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-secondary" onClick={handleReset}>
                                Convert More Files
                            </button>
                        </motion.div>
                    )}

                    {isConverting && (
                        <motion.div
                            className="converting-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <LoadingSpinner size="lg" />
                            <ProgressBar progress={progress} status="processing" />
                            <p>Converting {files.length} files...</p>
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
            </div>
        </div>
    )
}

export default BatchConverter
