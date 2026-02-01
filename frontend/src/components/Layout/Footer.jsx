import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        converters: [
            { path: '/document', label: 'Document Converter' },
            { path: '/image', label: 'Image Converter' },
            { path: '/audio', label: 'Audio Converter' },
            { path: '/video', label: 'Video Converter' },
            { path: '/batch', label: 'Batch Converter' }
        ],
        features: [
            { label: 'Drag & Drop Upload' },
            { label: 'Batch Processing' },
            { label: 'Format Detection' },
            { label: 'High Quality Output' }
        ]
    }

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <motion.div
                                className="logo-icon"
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                            >
                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                    <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" fill="url(#footer-logo-gradient)" />
                                    <path d="M16 10L12 16L16 22L20 16L16 10Z" fill="white" />
                                    <defs>
                                        <linearGradient id="footer-logo-gradient" x1="4" y1="2" x2="28" y2="30">
                                            <stop stopColor="#10B981" />
                                            <stop offset="1" stopColor="#F59E0B" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </motion.div>
                            <span className="logo-text">UniConvert</span>
                        </Link>
                        <p className="footer-description">
                            Convert any file format with ease. Fast, secure, and reliable file conversion for documents, images, audio, and video.
                        </p>
                    </div>

                    <div className="footer-links-section">
                        <h4 className="footer-title">Converters</h4>
                        <ul className="footer-links">
                            {footerLinks.converters.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="footer-link">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-section">
                        <h4 className="footer-title">Features</h4>
                        <ul className="footer-links">
                            {footerLinks.features.map((item, index) => (
                                <li key={index}>
                                    <span className="footer-feature">{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-section">
                        <h4 className="footer-title">Supported Formats</h4>
                        <div className="format-badges">
                            <span className="format-badge">PDF</span>
                            <span className="format-badge">DOCX</span>
                            <span className="format-badge">PNG</span>
                            <span className="format-badge">MP4</span>
                            <span className="format-badge">MP3</span>
                            <span className="format-badge">ZIP</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">© {currentYear} UniConvert. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <span className="footer-bottom-link">Privacy Policy</span>
                        <span className="footer-bottom-link">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
