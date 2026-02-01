import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FileUploader.css'

function FileUploader({
    onFilesSelected,
    accept,
    multiple = false,
    maxSize = 100 * 1024 * 1024,
    maxFiles = 20
}) {
    const [isDragActive, setIsDragActive] = useState(false)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)

    const validateFiles = useCallback((files) => {
        const validFiles = []
        const errors = []

        for (const file of files) {
            if (file.size > maxSize) {
                errors.push(`${file.name} is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
                continue
            }
            validFiles.push(file)
        }

        if (!multiple && validFiles.length > 1) {
            return { files: [validFiles[0]], errors }
        }

        if (validFiles.length > maxFiles) {
            return { files: validFiles.slice(0, maxFiles), errors: [...errors, `Only first ${maxFiles} files selected`] }
        }

        return { files: validFiles, errors }
    }, [maxSize, maxFiles, multiple])

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true)
        } else if (e.type === 'dragleave') {
            setIsDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        setError(null)

        const files = Array.from(e.dataTransfer.files)
        const { files: validFiles, errors } = validateFiles(files)

        if (errors.length > 0) {
            setError(errors[0])
        }

        if (validFiles.length > 0) {
            onFilesSelected(validFiles)
        }
    }, [onFilesSelected, validateFiles])

    const handleChange = useCallback((e) => {
        setError(null)
        const files = Array.from(e.target.files)
        const { files: validFiles, errors } = validateFiles(files)

        if (errors.length > 0) {
            setError(errors[0])
        }

        if (validFiles.length > 0) {
            onFilesSelected(validFiles)
        }
    }, [onFilesSelected, validateFiles])

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <div className="file-uploader-wrapper">
            <motion.div
                className={`file-uploader ${isDragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="file-input"
                />

                <motion.div
                    className="upload-icon"
                    animate={isDragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </motion.div>

                <div className="upload-text">
                    <p className="upload-title">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="upload-subtitle">
                        or <span className="upload-browse">browse</span> to choose files
                    </p>
                </div>

                <div className="upload-info">
                    <span>Max file size: {Math.round(maxSize / 1024 / 1024)}MB</span>
                    {multiple && <span>Max files: {maxFiles}</span>}
                </div>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="upload-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default FileUploader
