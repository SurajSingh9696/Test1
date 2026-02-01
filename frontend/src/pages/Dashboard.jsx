import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ConversionCard from '../components/Common/ConversionCard'
import { useConversion } from '../context/ConversionContext'
import './Dashboard.css'

function Dashboard() {
    const { getRecentConversions } = useConversion()
    const recentConversions = getRecentConversions(5)

    const categories = [
        {
            title: 'Documents',
            description: 'PDF, DOCX, Excel, CSV, JSON',
            path: '/document',
            color: 'primary',
            formats: ['PDF', 'DOCX', 'XLSX', 'CSV'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                </svg>
            )
        },
        {
            title: 'Images',
            description: 'JPG, PNG, WEBP, GIF, SVG',
            path: '/image',
            color: 'accent',
            formats: ['JPG', 'PNG', 'WEBP', 'GIF'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                </svg>
            )
        },
        {
            title: 'Audio',
            description: 'MP3, WAV, AAC, FLAC, OGG',
            path: '/audio',
            color: 'emerald',
            formats: ['MP3', 'WAV', 'AAC', 'FLAC'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            )
        },
        {
            title: 'Video',
            description: 'MP4, MKV, AVI, WEBM, MOV',
            path: '/video',
            color: 'amber',
            formats: ['MP4', 'MKV', 'AVI', 'WEBM'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
            )
        }
    ]

    const quickActions = [
        { label: 'PDF to DOCX', from: 'PDF', to: 'DOCX', path: '/document' },
        { label: 'JPG to PNG', from: 'JPG', to: 'PNG', path: '/image' },
        { label: 'MP4 to MP3', from: 'MP4', to: 'MP3', path: '/video' },
        { label: 'Compress Images', from: 'IMG', to: 'IMG', path: '/image' }
    ]

    return (
        <div className="dashboard">
            <div className="container">
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Select a conversion type to get started</p>
                </motion.div>

                <section className="dashboard-section">
                    <h2 className="section-title">Converters</h2>
                    <div className="converters-grid">
                        {categories.map((category, index) => (
                            <ConversionCard
                                key={category.path}
                                {...category}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </section>

                <div className="dashboard-row">
                    <section className="dashboard-section quick-actions-section">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="quick-actions">
                            {quickActions.map((action, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={action.path} className="quick-action">
                                        <div className="quick-action-formats">
                                            <span className="format-from">{action.from}</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                            <span className="format-to">{action.to}</span>
                                        </div>
                                        <span className="quick-action-label">{action.label}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-header-row">
                            <h2 className="section-title">Recent Conversions</h2>
                            <Link to="/history" className="view-all-link">View All</Link>
                        </div>
                        {recentConversions.length > 0 ? (
                            <div className="recent-conversions">
                                {recentConversions.map((conversion) => (
                                    <div key={conversion.id} className="recent-item">
                                        <div className="recent-info">
                                            <span className="recent-filename">{conversion.originalName}</span>
                                            <span className="recent-details">
                                                {conversion.type} → {conversion.outputFormat}
                                            </span>
                                        </div>
                                        <span className={`recent-status status-${conversion.status}`}>
                                            {conversion.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <p>No recent conversions</p>
                                <span>Your conversion history will appear here</span>
                            </div>
                        )}
                    </section>
                </div>

                <section className="dashboard-section batch-section">
                    <motion.div
                        className="batch-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="batch-content">
                            <div className="batch-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                    <path d="M12 12h.01" />
                                    <path d="M17 12h.01" />
                                    <path d="M7 12h.01" />
                                </svg>
                            </div>
                            <div className="batch-text">
                                <h3>Batch Conversion</h3>
                                <p>Convert multiple files at once for maximum efficiency</p>
                            </div>
                        </div>
                        <Link to="/batch" className="btn btn-primary">
                            Start Batch Convert
                        </Link>
                    </motion.div>
                </section>
            </div>
        </div>
    )
}

export default Dashboard
