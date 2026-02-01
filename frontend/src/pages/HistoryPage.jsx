import { motion } from 'framer-motion'
import { useConversion } from '../context/ConversionContext'
import { downloadFile } from '../services/api'
import './HistoryPage.css'

function HistoryPage() {
    const { conversions, clearHistory, removeConversion } = useConversion()

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="history-page">
            <div className="container">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="page-title">Conversion History</h1>
                    <p className="page-subtitle">View and manage your recent file conversions</p>
                </motion.div>

                {conversions.length > 0 ? (
                    <>
                        <div className="history-actions">
                            <span className="history-count">{conversions.length} conversions</span>
                            <button className="btn btn-ghost btn-sm" onClick={clearHistory}>
                                Clear History
                            </button>
                        </div>

                        <div className="history-list">
                            {conversions.map((conversion, index) => (
                                <motion.div
                                    key={conversion.id}
                                    className="history-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="history-icon">
                                        {conversion.type === 'document' && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14,2 14,8 20,8" />
                                            </svg>
                                        )}
                                        {conversion.type === 'image' && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                            </svg>
                                        )}
                                        {conversion.type === 'audio' && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 18V5l12-2v13" />
                                                <circle cx="6" cy="18" r="3" />
                                            </svg>
                                        )}
                                        {conversion.type === 'video' && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="5,3 19,12 5,21 5,3" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="history-info">
                                        <span className="history-filename">{conversion.originalName}</span>
                                        <div className="history-meta">
                                            <span className="history-type">{conversion.type}</span>
                                            <span className="history-arrow">→</span>
                                            <span className="history-format">{conversion.outputFormat?.toUpperCase()}</span>
                                            <span className="history-time">{formatDate(conversion.timestamp)}</span>
                                        </div>
                                    </div>

                                    <div className="history-actions-right">
                                        <span className={`history-status status-${conversion.status}`}>
                                            {conversion.status}
                                        </span>
                                        {conversion.status === 'success' && conversion.filename && (
                                            <a
                                                href={downloadFile(conversion.filename)}
                                                className="btn btn-primary btn-sm"
                                                download
                                            >
                                                Download
                                            </a>
                                        )}
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeConversion(conversion.id)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <h3>No Conversion History</h3>
                        <p>Your converted files will appear here</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default HistoryPage
