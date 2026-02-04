import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 1800000 // 30 minutes for large video conversions
})

api.interceptors.response.use(
    response => response,
    error => {
        const message = error.response?.data?.error || error.message || 'An error occurred'
        return Promise.reject(new Error(message))
    }
)

export const documentAPI = {
    convert: (file, outputFormat, onProgress = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        return api.post('/documents/convert', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    docxToHtml: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/documents/docx-to-html', formData)
    },

    csvToJson: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/documents/csv-to-json', formData)
    },

    jsonToCsv: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/documents/json-to-csv', formData)
    },

    textToPdf: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/documents/text-to-pdf', formData)
    },

    getFormats: () => api.get('/documents/formats')
}

export const imageAPI = {
    convert: (file, outputFormat, options = {}) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                formData.append(key, value)
            }
        })
        return api.post('/images/convert', formData)
    },

    compress: (file, quality) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('quality', quality)
        return api.post('/images/compress', formData)
    },

    resize: (file, width, height, fit) => {
        const formData = new FormData()
        formData.append('file', file)
        if (width) formData.append('width', width)
        if (height) formData.append('height', height)
        if (fit) formData.append('fit', fit)
        return api.post('/images/resize', formData)
    },

    crop: (file, left, top, width, height) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('left', left)
        formData.append('top', top)
        formData.append('width', width)
        formData.append('height', height)
        return api.post('/images/crop', formData)
    },

    batch: (files, outputFormat, quality) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('outputFormat', outputFormat)
        if (quality) formData.append('quality', quality)
        return api.post('/images/batch', formData)
    },

    getMetadata: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/images/metadata', formData)
    },

    pdfToImage: (file, outputFormat = 'png', page = null, onProgress = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        if (page) formData.append('page', page)
        return api.post('/images/pdf-to-image', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    imageToPdf: (files, onProgress = null) => {
        const formData = new FormData()
        // Support both single file and array of files
        const fileArray = Array.isArray(files) ? files : [files]
        fileArray.forEach(file => {
            formData.append('files', file)
        })
        return api.post('/images/image-to-pdf', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    getFormats: () => api.get('/images/formats')
}

export const audioAPI = {
    convert: (file, outputFormat, options = {}, onProgress = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                formData.append(key, value)
            }
        })
        return api.post('/audio/convert', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    trim: (file, startTime, duration) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('startTime', startTime)
        formData.append('duration', duration)
        return api.post('/audio/trim', formData)
    },

    merge: (files, outputFormat) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('outputFormat', outputFormat)
        return api.post('/audio/merge', formData)
    },

    getMetadata: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/audio/metadata', formData)
    },

    getFormats: () => api.get('/audio/formats')
}

export const videoAPI = {
    convert: (file, outputFormat, options = {}, onProgress = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                formData.append(key, value)
            }
        })
        return api.post('/video/convert', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    compress: (file, quality) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('quality', quality)
        return api.post('/video/compress', formData)
    },

    trim: (file, startTime, duration) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('startTime', startTime)
        formData.append('duration', duration)
        return api.post('/video/trim', formData)
    },

    extractAudio: (file, outputFormat, onProgress = null) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('outputFormat', outputFormat)
        return api.post('/video/extract-audio', formData, {
            onUploadProgress: onProgress ? (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            } : undefined
        })
    },

    changeResolution: (file, resolution) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('resolution', resolution)
        return api.post('/video/change-resolution', formData)
    },

    getMetadata: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/video/metadata', formData)
    },

    getFormats: () => api.get('/video/formats')
}

export const archiveAPI = {
    createZip: (files, archiveName) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        if (archiveName) formData.append('archiveName', archiveName)
        return api.post('/archives/create-zip', formData)
    },

    createTar: (files, archiveName) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        if (archiveName) formData.append('archiveName', archiveName)
        return api.post('/archives/create-tar', formData)
    },

    extract: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/archives/extract', formData)
    },

    compress: (files, format, archiveName) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('format', format)
        if (archiveName) formData.append('archiveName', archiveName)
        return api.post('/archives/compress', formData)
    },

    getFormats: () => api.get('/archives/formats')
}

export const healthCheck = () => api.get('/health')

export const getAllFormats = () => api.get('/formats')

export const downloadFile = (filename) => {
    return `${API_BASE_URL}/download/${filename}`
}

export default api
