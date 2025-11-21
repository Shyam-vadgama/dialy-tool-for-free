import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutGrid,
    FileImage,
    FileText,
    Code,
    Shield,
    QrCode,
    Link as LinkIcon,
    Type,
    Fingerprint,
    FileCode,
    Palette,
    Ruler,
    Binary
} from 'lucide-react';
import '../styles/glass.css';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/' },
        { icon: FileImage, label: 'Image Tools', path: '/tools/image' },
        { icon: FileImage, label: 'Image Editor', path: '/tools/image-editor' },
        { icon: FileText, label: 'PDF Tools', path: '/tools/pdf' },
        { icon: FileText, label: 'PDF Editor', path: '/tools/pdf-editor' },
        { icon: QrCode, label: 'QR Generator', path: '/tools/qr' },
        { icon: LinkIcon, label: 'URL Encoder', path: '/tools/url' },
        { icon: Type, label: 'Text Tools', path: '/tools/text' },
        { icon: Code, label: 'JSON Formatter', path: '/tools/dev' },
        { icon: Fingerprint, label: 'UUID Gen', path: '/tools/uuid' },
        { icon: FileCode, label: 'Markdown', path: '/tools/markdown' },
        { icon: Shield, label: 'Password Gen', path: '/tools/security' },
        { icon: Palette, label: 'Color Tools', path: '/tools/color' },
        { icon: Ruler, label: 'Unit Converter', path: '/tools/units' },
        { icon: Binary, label: 'Base64', path: '/tools/base64' },
    ];

    return (
        <aside className="sidebar glass-panel" style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-lg)',
            zIndex: 100
        }}>
            <div className="logo-container" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ToolHub
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', overflowY: 'auto', paddingRight: '4px' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                border: isActive ? '1px solid var(--accent-glow)' : '1px solid transparent',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                            <span style={{ fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Pro Version
                    </p>
                    <button className="glass-button" style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                        Upgrade
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
