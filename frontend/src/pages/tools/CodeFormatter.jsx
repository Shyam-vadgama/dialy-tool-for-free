import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const CodeFormatter = () => {
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const languages = [
        { label: 'Python', value: 'python' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'JSON', value: 'json' },
    ];

    const formatCode = async () => {
        setLoading(true);
        setError('');
        setOutputCode('');
        try {
            const response = await fetch('http://localhost:8000/api/format-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: inputCode, language }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to format code');
            }

            const data = await response.json();
            setOutputCode(data.formatted_code);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Code Formatter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Format your code for various programming languages.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            >
                                {languages.map((lang) => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={formatCode}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-xl)',
                                borderRadius: 'var(--radius-md)',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Formatting...' : <><Code size={18} /> Format</>}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-xl)',
                                borderRadius: 'var(--radius-md)',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                background: copied ? '#22c55e' : 'var(--bg-tertiary)'
                            }}
                            disabled={!outputCode}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />} Copy
                        </button>
                    </div>

                    {/* Input and Output areas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <textarea
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            className="glass-input"
                            placeholder="Enter code here..."
                            style={{
                                width: '100%',
                                height: '400px',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--radius-md)',
                                resize: 'vertical',
                                fontSize: '1rem',
                                fontFamily: 'monospace'
                            }}
                        />
                        <textarea
                            readOnly
                            value={error || outputCode}
                            className="glass-input"
                            placeholder="Formatted code will appear here..."
                            style={{
                                width: '100%',
                                height: '400px',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--radius-md)',
                                resize: 'vertical',
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                backgroundColor: error ? 'var(--color-error-bg)' : 'rgba(0,0,0,0.1)',
                                color: error ? 'var(--color-error-text)' : 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeFormatter;
