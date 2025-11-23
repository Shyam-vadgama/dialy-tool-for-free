import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
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
import ToolCard from '../components/ToolCard';

const categories = [
    {
        title: 'Media Tools',
        tools: [
            { title: 'Image Converter', description: 'Convert images between PNG, JPG, WEBP formats.', icon: FileImage, path: '/tools/image', color: '#3b82f6' },
            { title: 'Image Editor', description: 'Edit images with basic operations like rotate, flip, and grayscale.', icon: FileImage, path: '/tools/image-editor', color: '#3b82f6' },
            { title: 'PDF Tools', description: 'Merge PDFs or extract specific pages easily.', icon: FileText, path: '/tools/pdf', color: '#ef4444' },
            { title: 'PDF Editor', description: 'Perform various operations on PDF files like merging, splitting, and rotating pages.', icon: FileText, path: '/tools/pdf-editor', color: '#ef4444' },

        ]
    },
    {
        title: 'Developer Utilities',
        tools: [
            { title: 'JSON Formatter', description: 'Validate, format, and minify JSON data.', icon: Code, path: '/tools/dev', color: '#eab308' },
            { title: 'UUID Generator', description: 'Generate random version 4 UUIDs in bulk.', icon: Fingerprint, path: '/tools/uuid', color: '#8b5cf6' },
            { title: 'Base64 Converter', description: 'Encode and decode text or files to Base64.', icon: Binary, path: '/tools/base64', color: '#ec4899' },
        ]
    },
    {
        title: 'Text & Content',
        tools: [
            { title: 'Markdown Preview', description: 'Real-time Markdown editor and previewer.', icon: FileCode, path: '/tools/markdown', color: '#10b981' },
            { title: 'Text Converter', description: 'Change case, count words, remove duplicates.', icon: Type, path: '/tools/text', color: '#06b6d4' },
            { title: 'URL Encoder', description: 'Encode or decode URLs safely.', icon: LinkIcon, path: '/tools/url', color: '#f97316' },
        ]
    },
    {
        title: 'Daily Essentials',
        tools: [
            { title: 'QR Generator', description: 'Create custom QR codes for any link or text.', icon: QrCode, path: '/tools/qr', color: '#14b8a6' },
            { title: 'Password Gen', description: 'Create strong, secure passwords instantly.', icon: Shield, path: '/tools/security', color: '#22c55e' },
            { title: 'Color Tools', description: 'Pick, convert, and generate color palettes.', icon: Palette, path: '/tools/color', color: '#f43f5e' },
            { title: 'Unit Converter', description: 'Convert length, weight, temperature, and more.', icon: Ruler, path: '/tools/units', color: '#6366f1' },
        ]
        
    }
];

const Home = () => {
    const [search, setSearch] = useState('');

    const filteredCategories = categories.map(cat => ({
        ...cat,
        tools: cat.tools.filter(tool =>
            tool.title.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.tools.length > 0);

    return (
        <div className="container">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', marginBottom: 'var(--spacing-xl)' }}
            >
                <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 'var(--spacing-md)', letterSpacing: '-0.02em' }}>
                    All Your Tools in One Place
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto var(--spacing-xl)' }}>
                    A professional suite of utilities for developers, designers, and everyone in between. Free, fast, and secure.
                </p>

                <div className="glass-input" style={{
                    maxWidth: '500px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--accent-glow)',
                    boxShadow: '0 0 20px -5px var(--accent-glow)'
                }}>
                    <Search size={20} color="var(--text-muted)" style={{ marginRight: 'var(--spacing-md)' }} />
                    <input
                        type="text"
                        placeholder="Search for a tool..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '1.1rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                </div>
            </motion.div>

            {/* Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                {filteredCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                            {category.title}
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 'var(--spacing-lg)'
                        }}>
                            {category.tools.map(tool => (
                                <ToolCard key={tool.title} {...tool} />
                            ))}
                        </div>
                    </motion.div>
                ))}

                {filteredCategories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                        <p>No tools found matching "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
