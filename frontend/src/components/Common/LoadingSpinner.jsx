import { motion } from 'framer-motion'
import './LoadingSpinner.css'

function LoadingSpinner({ size = 'md', text }) {
    const sizeMap = {
        sm: 24,
        md: 40,
        lg: 60
    }

    const spinnerSize = sizeMap[size] || sizeMap.md

    return (
        <div className="loading-spinner-wrapper">
            <motion.div
                className="loading-spinner"
                style={{ width: spinnerSize, height: spinnerSize }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <svg viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="4"
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="url(#spinner-gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="80 200"
                    />
                    <defs>
                        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="var(--color-accent)" />
                        </linearGradient>
                    </defs>
                </svg>
            </motion.div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    )
}

export default LoadingSpinner
