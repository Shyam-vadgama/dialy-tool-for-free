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
    Binary,
    BookOpen,
    Clock,
    Calendar,
    Scale,
    CalendarDays,
    Hash,
    Network,
    Divide,
    Calculator,
    Octagon,
    ArrowRightLeft,
    Search
} from 'lucide-react';
import '../styles/glass.css';

const Sidebar = () => {
    const location = useLocation();

    const categorizedNavItems = [
        {
            category: 'General',
            items: [
                { icon: LayoutGrid, label: 'Dashboard', path: '/' },
            ]
        },
        {
            category: 'Image Tools',
            items: [
                { icon: FileImage, label: 'Image Converter', path: '/tools/image' },
                { icon: FileImage, label: 'Image Editor', path: '/tools/image-editor' },
            ]
        },
        {
            category: 'PDF Tools',
            items: [
                { icon: FileText, label: 'PDF Tools', path: '/tools/pdf' },
                { icon: FileText, label: 'PDF Editor', path: '/tools/pdf-editor' },
            ]
        },
        {
            category: 'Security',
            items: [
                { icon: Shield, label: 'Security Tools', path: '/tools/security' },
            ]
        },
        {
            category: 'Developer',
            items: [
                { icon: Code, label: 'JSON Formatter', path: '/tools/dev' },
                { icon: Fingerprint, label: 'UUID Gen', path: '/tools/uuid' },
                { icon: Binary, label: 'Base64', path: '/tools/base64' },
                { icon: LinkIcon, label: 'URL Encoder', path: '/tools/url' },
                { icon: FileCode, label: 'Markdown', path: '/tools/markdown' },
                { icon: Code, label: 'Code Formatter', path: '/tools/code-formatter' },
                { icon: Binary, label: 'Binary Converter', path: '/tools/binary-converter' },
                { icon: Hash, label: 'Hex Converter', path: '/tools/hex-converter' },
                { icon: Network, label: 'IP Subnet Calc', path: '/tools/ip-subnet-calculator' },
                { icon: Octagon, label: 'Octal Converter', path: '/tools/octal-converter' },
            ]
        },
        {
            category: 'Text',
            items: [
                { icon: Type, label: 'Text Tools', path: '/tools/text' },
                { icon: BookOpen, label: 'Word Counter', path: '/tools/word-counter' },
                { icon: FileText, label: 'Lorem Ipsum', path: '/tools/lorem-ipsum' },
                { icon: Type, label: 'Typing Master', path: '/tools/typing-master' },
            ]
        },
        {
            category: 'Other',
            items: [
                { icon: QrCode, label: 'QR Generator', path: '/tools/qr' },
                { icon: Palette, label: 'Color Tools', path: '/tools/color' },
                { icon: Ruler, label: 'Unit Converter', path: '/tools/units' },
                { icon: Clock, label: 'Time Zone Converter', path: '/tools/timezone-converter' },
                { icon: Calendar, label: 'Age Calculator', path: '/tools/age-calculator' },
                { icon: CalendarDays, label: 'Date Calculator', path: '/tools/date-calculator' },
                { icon: Scale, label: 'BMI Calculator', path: '/tools/bmi-calculator' },
                { icon: Divide, label: 'Factor Calculator', path: '/tools/factor-calculator' },
                { icon: Calculator, label: 'Scientific Calc', path: '/tools/scientific-calculator' },
                { icon: ArrowRightLeft, label: 'Unit Converter', path: '/tools/unit-converter' },
                { icon: Search, label: 'Universal Scraper', path: '/tools/universal-scraper' },
            ]
        }
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
                {categorizedNavItems.map((category) => (
                    <div key={category.category}>
                        <h2 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            fontWeight: 'bold',
                            margin: 'var(--spacing-lg) 0 var(--spacing-sm) var(--spacing-md)'
                        }}>
                            {category.category}
                        </h2>
                        {category.items.map((item) => {
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
                    </div>
                ))}
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