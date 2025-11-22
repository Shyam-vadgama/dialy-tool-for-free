import React, { useState } from 'react';
import { FileText, Copy, Check, RefreshCw } from 'lucide-react';

const LoremIpsumGenerator = () => {
    const [paragraphs, setParagraphs] = useState(3);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    const loremIpsumSentences = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    ];

    const generateLoremIpsum = () => {
        let text = [];
        for (let i = 0; i < paragraphs; i++) {
            let paragraph = [];
            for (let j = 0; j < Math.floor(Math.random() * 3) + 3; j++) { // 3-5 sentences per paragraph
                paragraph.push(loremIpsumSentences[Math.floor(Math.random() * loremIpsumSentences.length)]);
            }
            text.push(paragraph.join(' '));
        }
        setGeneratedText(text.join('\n\n'));
    };

    React.useEffect(() => {
        generateLoremIpsum();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Lorem Ipsum Generator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Generate placeholder text for your designs or mockups.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Paragraphs</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={paragraphs}
                                onChange={(e) => setParagraphs(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        <button
                            onClick={generateLoremIpsum}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-xl)',
                                borderRadius: 'var(--radius-md)',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}
                        >
                            <RefreshCw size={18} /> Generate
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
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />} Copy
                        </button>
                    </div>

                    {/* Output */}
                    <textarea
                        readOnly
                        value={generatedText}
                        className="glass-input"
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            resize: 'vertical',
                            fontSize: '1.1rem',
                            backgroundColor: 'rgba(0,0,0,0.1)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoremIpsumGenerator;
