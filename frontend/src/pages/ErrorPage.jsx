import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './ErrorPage.css'

function ErrorPage() {
    return (
        <div className="error-page">
            <div className="container">
                <motion.div
                    className="error-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="error-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                        </svg>
                    </motion.div>

                    <motion.h1
                        className="error-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        404
                    </motion.h1>

                    <motion.h2
                        className="error-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Page Not Found
                    </motion.h2>

                    <motion.p
                        className="error-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        The page you are looking for does not exist or has been moved.
                    </motion.p>

                    <motion.div
                        className="error-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link to="/" className="btn btn-primary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9,22 9,12 15,12 15,22" />
                            </svg>
                            Go Home
                        </Link>
                        <Link to="/dashboard" className="btn btn-secondary btn-lg">
                            Open Dashboard
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default ErrorPage
