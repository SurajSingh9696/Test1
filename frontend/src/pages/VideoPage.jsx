import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from '../components/Common/FileUploader'
import ProgressBar from '../components/Common/ProgressBar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { videoAPI, downloadFile } from '../services/api'
import { useConversion } from '../context/ConversionContext'
import './ConverterPage.css'

function VideoPage() {
    const [files, setFiles] = useState([])
    const [outputFormat, setOutputFormat] = useState('mp4')
    const [options, setOptions] = useState({ resolution: '', quality: 'medium' })
    const [isConverting, setIsConverting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const { addConversion, updateConversion } = useConversion()

    const formatOptions = [
        { value: 'mp4', label: 'MP4' },
        { value: 'mkv', label: 'MKV' },
        { value: 'avi', label: 'AVI' },
        { value: 'webm', label: 'WEBM' },
        { value: 'mov', label: 'MOV' }
    ]

    const resolutionOptions = [
        { value: '', label: 'Original' },
        { value: '1080p', label: '1080p' },
        { value: '720p', label: '720p' },
        { value: '480p', label: '480p' }
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
            type: 'video',
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
            const response = await videoAPI.convert(files[0], outputFormat, options, onProgress)

            if (processingInterval) clearInterval(processingInterval)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })

            updateConversion(conversionId, { status: 'success' })
        } catch (err) {
            if (processingInterval) clearInterval(processingInterval)
            setError(err.message)
            updateConversion(conversionId, { status: 'error' })
        } finally {
            setIsConverting(false)
        }
    }

    const handleExtractAudio = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        setProgress(0)
        setError(null)
        setResult(null)

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
            const response = await videoAPI.extractAudio(files[0], 'mp3', onProgress)

            if (processingInterval) clearInterval(processingInterval)
            setProgress(100)

            setResult({
                filename: response.data.filename,
                downloadUrl: downloadFile(response.data.filename)
            })
        } catch (err) {
            if (processingInterval) clearInterval(processingInterval)
            setError(err.message)
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
                    <div className="header-icon video-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5,3 19,12 5,21 5,3" />
                        </svg>
                    </div>
                    <h1 className="page-title">Video Converter</h1>
                    <p className="page-subtitle">Convert video, change resolution, extract audio</p>
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
                                        accept="video/*,.mp4,.mkv,.avi,.webm,.mov,.wmv,.flv"
                                    />

                                    {files.length > 0 && (
                                        <motion.div
                                            className="selected-files"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <h3>Selected Video</h3>
                                            <div className="file-item">
                                                <div className="file-info">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polygon points="5,3 19,12 5,21 5,3" />
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
                                    <p>Your video has been processed successfully</p>
                                    <div className="result-actions">
                                        <a href={result.downloadUrl} className="btn btn-primary btn-lg" download>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7,10 12,15 17,10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download
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
                                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                                    Video conversion may take a few minutes...
                                </p>
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

                        <div className="sidebar-card">
                            <h3>Video Options</h3>
                            <div className="option-row">
                                <label>Resolution</label>
                                <select
                                    value={options.resolution}
                                    onChange={(e) => setOptions({ ...options, resolution: e.target.value })}
                                >
                                    {resolutionOptions.map((res) => (
                                        <option key={res.value} value={res.value}>{res.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="option-row">
                                <label>Quality</label>
                                <select
                                    value={options.quality}
                                    onChange={(e) => setOptions({ ...options, quality: e.target.value })}
                                >
                                    <option value="low">Low (smaller file)</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High (larger file)</option>
                                </select>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary btn-lg w-full convert-btn"
                                onClick={handleConvert}
                                disabled={files.length === 0 || isConverting}
                            >
                                {isConverting ? 'Converting...' : 'Convert Video'}
                            </button>
                            <button
                                className="btn btn-secondary w-full"
                                onClick={handleExtractAudio}
                                disabled={files.length === 0 || isConverting}
                            >
                                Extract Audio (MP3)
                            </button>
                        </div>

                        <div className="sidebar-card info-card">
                            <h4>Supported Conversions</h4>
                            <ul>
                                <li>MP4 ↔ MKV, AVI, WEBM</li>
                                <li>MOV → MP4, MKV</li>
                                <li>Video → Audio (MP3)</li>
                                <li>Resolution: 4K to 360p</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPage
