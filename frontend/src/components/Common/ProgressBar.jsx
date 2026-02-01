import { motion } from 'framer-motion'
import './ProgressBar.css'

function ProgressBar({ progress, status, showPercentage = true }) {
    const getStatusColor = () => {
        if (status === 'error') return 'var(--color-error)'
        if (status === 'success') return 'var(--color-success)'
        return 'var(--color-primary)'
    }

    return (
        <div className="progress-wrapper">
            <div className="progress-header">
                <span className="progress-status">
                    {status === 'processing' && 'Converting...'}
                    {status === 'success' && 'Complete!'}
                    {status === 'error' && 'Error'}
                    {status === 'uploading' && 'Uploading...'}
                </span>
                {showPercentage && (
                    <span className="progress-percentage">{Math.round(progress)}%</span>
                )}
            </div>
            <div className="progress-track">
                <motion.div
                    className="progress-fill"
                    style={{ backgroundColor: getStatusColor() }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                {status === 'processing' && (
                    <motion.div
                        className="progress-shine"
                        animate={{ x: ['0%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                )}
            </div>
        </div>
    )
}

export default ProgressBar
