import toast from 'react-hot-toast'

const toastStyles = {
    style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
    },
    success: {
        iconTheme: {
            primary: '#10B981',
            secondary: '#ffffff'
        }
    },
    error: {
        iconTheme: {
            primary: '#EF4444',
            secondary: '#ffffff'
        }
    }
}

export const showSuccess = (message) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
        ...toastStyles,
        ...toastStyles.success
    })
}

export const showError = (message) => {
    toast.error(message, {
        duration: 6000,
        position: 'top-right',
        ...toastStyles,
        ...toastStyles.error
    })
}

export const showLoading = (message) => {
    return toast.loading(message, {
        position: 'top-right',
        ...toastStyles
    })
}

export const dismissToast = (toastId) => {
    toast.dismiss(toastId)
}

export const showConversionSuccess = (filename) => {
    showSuccess(`Successfully converted to ${filename}`)
}

export const showConversionError = (error) => {
    const errorMessages = {
        FILE_TOO_LARGE: 'File is too large. Maximum size is 100MB.',
        UNSUPPORTED_FORMAT: 'This file format is not supported.',
        FFMPEG_NOT_FOUND: 'FFmpeg is required for audio/video conversions.',
        LIBREOFFICE_NOT_FOUND: 'LibreOffice is required for some document conversions.',
        FILE_NOT_FOUND: 'File not found or has expired.',
        CONVERSION_TIMEOUT: 'Conversion timed out. Try a smaller file.',
        CORRUPTED_FILE: 'File appears to be corrupted.',
        OUT_OF_MEMORY: 'File too large to process.',
        PERMISSION_DENIED: 'Permission denied while processing.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        UNKNOWN_ERROR: 'An unexpected error occurred.'
    }

    const message = error?.code
        ? errorMessages[error.code] || error.message || errorMessages.UNKNOWN_ERROR
        : error?.message || errorMessages.UNKNOWN_ERROR

    showError(message)
}

export const showUploadProgress = (filename) => {
    return showLoading(`Uploading ${filename}...`)
}

export const showProcessing = () => {
    return showLoading('Converting your file...')
}

export default {
    showSuccess,
    showError,
    showLoading,
    dismissToast,
    showConversionSuccess,
    showConversionError,
    showUploadProgress,
    showProcessing
}
