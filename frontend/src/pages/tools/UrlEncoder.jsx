import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';

const UrlEncoder = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
    const [copied, setCopied] = useState(false);

    const handleConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
        } catch (e) {
            setOutput('Error: Invalid URL format');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>URL Encoder / Decoder</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Encode text to URL-safe format or decode it back.</p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '4px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex'
                    }}>
                        <button
                            onClick={() => setMode('encode')}
                            style={{
                                padding: '8px 24px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: mode === 'encode' ? 'var(--accent-primary)' : 'transparent',
                                color: mode === 'encode' ? 'white' : 'var(--text-secondary)',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            Encode
                        </button>
                        <button
                            onClick={() => setMode('decode')}
                            style={{
                                padding: '8px 24px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: mode === 'decode' ? 'var(--accent-primary)' : 'transparent',
                                color: mode === 'decode' ? 'white' : 'var(--text-secondary)',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            Decode
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexDirection: 'column' }}>

                    {/* Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Input</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL to decode...'}
                            className="glass-input"
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleConvert}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-xl)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}
                        >
                            <ArrowRightLeft size={18} /> Convert
                        </button>
                    </div>

                    {/* Output */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <label style={{ fontWeight: 500 }}>Output</label>
                            <button
                                onClick={handleCopy}
                                disabled={!output}
                                className="glass-button"
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: !output ? 0.5 : 1
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            className="glass-input"
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                resize: 'vertical',
                                background: 'rgba(0,0,0,0.3)'
                            }}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UrlEncoder;
