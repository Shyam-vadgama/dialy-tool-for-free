import React, { useState } from 'react';
import { Type, Copy, Check, Trash2 } from 'lucide-react';

const TextConverter = () => {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);

    const stats = {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.trim() ? text.split(/\n/).length : 0,
    };

    const transform = (type) => {
        switch (type) {
            case 'upper': setText(text.toUpperCase()); break;
            case 'lower': setText(text.toLowerCase()); break;
            case 'title':
                setText(text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
                break;
            case 'sentence':
                setText(text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase()));
                break;
            case 'reverse': setText(text.split('').reverse().join('')); break;
            case 'dedupe':
                const lines = text.split('\n');
                const unique = [...new Set(lines)];
                setText(unique.join('\n'));
                break;
            default: break;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Text Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Change case, count words, and clean up text.</p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flex: 1, minHeight: 0 }}>

                {/* Main Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span>{stats.words} words</span>
                            <span>{stats.chars} chars</span>
                            <span>{stats.lines} lines</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                onClick={() => setText('')}
                                className="glass-button"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
                            >
                                <Trash2 size={14} /> Clear
                            </button>
                            <button
                                onClick={handleCopy}
                                className="glass-button"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px' }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />} Copy
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="glass-input"
                        style={{
                            flex: 1,
                            resize: 'none',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                        }}
                    />
                </div>

                {/* Sidebar Actions */}
                <div className="glass-panel" style={{
                    width: '250px',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-xs)' }}>Actions</h3>

                    <button onClick={() => transform('upper')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        UPPERCASE
                    </button>
                    <button onClick={() => transform('lower')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        lowercase
                    </button>
                    <button onClick={() => transform('title')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        Title Case
                    </button>
                    <button onClick={() => transform('sentence')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        Sentence case
                    </button>
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: 'var(--spacing-xs) 0' }} />
                    <button onClick={() => transform('reverse')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        Reverse Text
                    </button>
                    <button onClick={() => transform('dedupe')} className="glass-button" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                        Remove Duplicates
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TextConverter;
