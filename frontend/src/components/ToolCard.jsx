import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ToolCard = ({ title, description, icon: Icon, path, color = 'var(--accent-primary)' }) => {
    return (
        <Link to={path}>
            <motion.div
                className="glass-card"
                whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`,
                    borderRadius: '0 var(--radius-lg) 0 100%'
                }} />

                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)',
                    color: color
                }}>
                    <Icon size={24} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: 'var(--spacing-md)' }}>
                    {description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', color: color, fontSize: '0.9rem', fontWeight: 500 }}>
                    Try Tool <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                </div>
            </motion.div>
        </Link>
    );
};

export default ToolCard;
