import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './ConversionCard.css'

function ConversionCard({
    title,
    description,
    icon,
    path,
    formats,
    color = 'primary',
    delay = 0
}) {
    const colorClasses = {
        primary: 'card-primary',
        accent: 'card-accent',
        emerald: 'card-emerald',
        amber: 'card-amber'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -8 }}
        >
            <Link to={path} className={`conversion-card ${colorClasses[color]}`}>
                <div className="card-icon-wrapper">
                    <div className="card-icon">{icon}</div>
                    <div className="card-icon-glow" />
                </div>

                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>

                {formats && (
                    <div className="card-formats">
                        {formats.slice(0, 4).map((format, index) => (
                            <span key={index} className="format-tag">{format}</span>
                        ))}
                        {formats.length > 4 && (
                            <span className="format-more">+{formats.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </Link>
        </motion.div>
    )
}

export default ConversionCard
