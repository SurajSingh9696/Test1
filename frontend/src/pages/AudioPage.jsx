import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from '../components/Common/FileUploader'
import ProgressBar from '../components/Common/ProgressBar'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { audioAPI, downloadFile } from '../services/api'
import { useConversion } from '../context/ConversionContext'
import './ConverterPage.css'

function AudioPage() {
    const [files, setFiles] = useState([])
    const [outputFormat, setOutputFormat] = useState('mp3')
    const [options, setOptions] = useState({ bitrate: '192k', sampleRate: '44100' })
    const [isConverting, setIsConverting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const { addConversion, updateConversion } = useConversion()

    const formatOptions = [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'aac', label: 'AAC' },
        { value: 'ogg', label: 'OGG' },
        { value: 'flac', label: 'FLAC' }
    ]

    const bitrateOptions = ['64k', '128k', '192k', '256k', '320k']

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
            type: 'audio',
            outputFormat,
            status: 'processing'
        })

        try {
            setProgress(30)
            const response = await audioAPI.convert(files[0], outputFormat, options)
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
    }

    return (
        <div className="converter-page">
            <div className="container">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-icon audio-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                        </svg>
                    </div>
                    <h1 className="page-title">Audio Converter</h1>
                    <p className="page-subtitle">Convert audio files, adjust bitrate and quality</p>
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
                                        accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a,.wma"
                                    />

                                    {files.length > 0 && (
                                        <motion.div
                                            className="selected-files"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <h3>Selected Audio</h3>
                                            <div className="file-item">
                                                <div className="file-info">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M9 18V5l12-2v13" />
                                                        <circle cx="6" cy="18" r="3" />
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
                                    <h3>Audio Converted!</h3>
                                    <p>Your audio file has been converted successfully</p>
                                    <div className="result-actions">
                                        <a href={result.downloadUrl} className="btn btn-primary btn-lg" download>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7,10 12,15 17,10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download Audio
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

                        <div className="sidebar-card">
                            <h3>Audio Options</h3>
                            <div className="option-row">
                                <label>Bitrate</label>
                                <select
                                    value={options.bitrate}
                                    onChange={(e) => setOptions({ ...options, bitrate: e.target.value })}
                                >
                                    {bitrateOptions.map((rate) => (
                                        <option key={rate} value={rate}>{rate}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="option-row">
                                <label>Sample Rate</label>
                                <select
                                    value={options.sampleRate}
                                    onChange={(e) => setOptions({ ...options, sampleRate: e.target.value })}
                                >
                                    <option value="22050">22050 Hz</option>
                                    <option value="44100">44100 Hz</option>
                                    <option value="48000">48000 Hz</option>
                                </select>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg w-full convert-btn"
                            onClick={handleConvert}
                            disabled={files.length === 0 || isConverting}
                        >
                            {isConverting ? 'Converting...' : 'Convert Audio'}
                        </button>

                        <div className="sidebar-card info-card">
                            <h4>Supported Conversions</h4>
                            <ul>
                                <li>MP3 ↔ WAV, AAC, OGG</li>
                                <li>WAV ↔ MP3, FLAC</li>
                                <li>AAC ↔ MP3, WAV</li>
                                <li>FLAC ↔ MP3, WAV</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudioPage
