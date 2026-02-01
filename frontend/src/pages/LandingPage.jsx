import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ConversionCard from '../components/Common/ConversionCard'
import './LandingPage.css'

function LandingPage() {
    const categories = [
        {
            title: 'Document Converter',
            description: 'Convert PDF, DOCX, Excel, PowerPoint and more',
            path: '/document',
            color: 'primary',
            formats: ['PDF', 'DOCX', 'XLSX', 'PPTX', 'HTML'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            )
        },
        {
            title: 'Image Converter',
            description: 'Convert, resize, compress images in any format',
            path: '/image',
            color: 'accent',
            formats: ['JPG', 'PNG', 'WEBP', 'SVG', 'GIF'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                </svg>
            )
        },
        {
            title: 'Audio Converter',
            description: 'Convert audio files, trim, merge and adjust quality',
            path: '/audio',
            color: 'emerald',
            formats: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            )
        },
        {
            title: 'Video Converter',
            description: 'Convert video, change resolution, extract audio',
            path: '/video',
            color: 'amber',
            formats: ['MP4', 'MKV', 'AVI', 'WEBM', 'MOV'],
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                </svg>
            )
        }
    ]

    const features = [
        { icon: '⚡', title: 'Lightning Fast', description: 'Convert files in seconds with optimized processing' },
        { icon: '🔒', title: 'Secure & Private', description: 'Files are automatically deleted after conversion' },
        { icon: '🎨', title: 'High Quality', description: 'Maintain original quality during conversion' },
        { icon: '📦', title: 'Batch Convert', description: 'Convert multiple files at once' }
    ]

    return (
        <div className="landing-page">
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-gradient" />
                    <div className="hero-pattern" />
                </div>

                <div className="container hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="hero-text"
                    >
                        <span className="hero-badge">All-in-One Converter</span>
                        <h1 className="hero-title">
                            Convert <span className="gradient-text">Anything</span> to
                            <span className="gradient-text"> Everything</span>
                        </h1>
                        <p className="hero-subtitle">
                            The ultimate file conversion platform. Convert documents, images, audio,
                            and video files with just a few clicks.
                        </p>
                        <div className="hero-actions">
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Start Converting
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link to="/batch" className="btn btn-secondary btn-lg">
                                Batch Convert
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="stat-item">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Formats Supported</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-number">100MB</span>
                            <span className="stat-label">Max File Size</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-number">Free</span>
                            <span className="stat-label">No Registration</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="categories-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Choose Your Converter</h2>
                        <p className="section-subtitle">
                            Select a category to start converting your files
                        </p>
                    </motion.div>

                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <ConversionCard
                                key={category.path}
                                {...category}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Why Choose UniConvert?</h2>
                        <p className="section-subtitle">
                            Powerful features designed for the best conversion experience
                        </p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                            >
                                <span className="feature-icon">{feature.icon}</span>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="cta-title">Ready to Convert?</h2>
                        <p className="cta-subtitle">
                            Start converting your files now. No sign-up required.
                        </p>
                        <Link to="/dashboard" className="btn btn-accent btn-lg">
                            Get Started Free
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage
