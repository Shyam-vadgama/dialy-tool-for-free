import React, { useState } from 'react';
import { Copy, Check, Trash2, Code } from 'lucide-react';

const JsonFormatter = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleFormat = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err) {
            setError(err.message);
            setOutput('');
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (err) {
            setError(err.message);
            setOutput('');
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        setError(null);
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>JSON Formatter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Validate, format, and minify your JSON data.</p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flex: 1, minHeight: 0 }}>

                {/* Input Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 500 }}>Input JSON</label>
                        <button
                            onClick={handleClear}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                fontSize: '0.8rem',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5'
                            }}
                        >
                            <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="glass-input"
                        style={{
                            flex: 1,
                            resize: 'none',
                            padding: 'var(--spacing-md)',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            borderRadius: 'var(--radius-md)'
                        }}
                    />
                </div>

                {/* Controls (Middle) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={handleFormat}
                        className="glass-button"
                        style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        title="Format"
                    >
                        Format &rarr;
                    </button>
                    <button
                        onClick={handleMinify}
                        className="glass-button"
                        style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}
                        title="Minify"
                    >
                        Minify &rarr;
                    </button>
                </div>

                {/* Output Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 500 }}>Output</label>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: !output ? 0.5 : 1
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <div className="glass-panel" style={{
                        flex: 1,
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                    }}>
                        {error ? (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                color: '#fca5a5',
                                background: 'rgba(239, 68, 68, 0.1)',
                                height: '100%'
                            }}>
                                <strong>Error:</strong> {error}
                            </div>
                        ) : (
                            <textarea
                                readOnly
                                value={output}
                                className="glass-input"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    resize: 'none',
                                    padding: 'var(--spacing-md)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    border: 'none',
                                    background: 'transparent'
                                }}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JsonFormatter;
