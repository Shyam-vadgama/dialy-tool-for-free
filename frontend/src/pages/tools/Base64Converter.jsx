import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, File as FileIcon } from 'lucide-react';

const Base64Converter = () => {
    const [activeTab, setActiveTab] = useState('text');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');
    const [copied, setCopied] = useState(false);

    const handleTextConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(btoa(input));
            } else {
                setOutput(atob(input));
            }
        } catch (e) {
            setOutput('Error: Invalid Base64 string');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setOutput(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Base64 Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Encode and decode text or files to Base64.</p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    <button
                        onClick={() => setActiveTab('text')}
                        className="glass-button"
                        style={{
                            background: activeTab === 'text' ? 'var(--accent-primary)' : 'transparent',
                            padding: '8px 24px',
                            borderRadius: 'var(--radius-full)'
                        }}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => setActiveTab('file')}
                        className="glass-button"
                        style={{
                            background: activeTab === 'file' ? 'var(--accent-primary)' : 'transparent',
                            padding: '8px 24px',
                            borderRadius: 'var(--radius-full)'
                        }}
                    >
                        File (Image/PDF)
                    </button>
                </div>

                {activeTab === 'text' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: 'var(--radius-full)', display: 'flex' }}>
                                <button onClick={() => setMode('encode')} style={{ padding: '8px 24px', borderRadius: 'var(--radius-full)', border: 'none', background: mode === 'encode' ? 'var(--accent-primary)' : 'transparent', color: mode === 'encode' ? 'white' : 'var(--text-secondary)', cursor: 'pointer' }}>Encode</button>
                                <button onClick={() => setMode('decode')} style={{ padding: '8px 24px', borderRadius: 'var(--radius-full)', border: 'none', background: mode === 'decode' ? 'var(--accent-primary)' : 'transparent', color: mode === 'decode' ? 'white' : 'var(--text-secondary)', cursor: 'pointer' }}>Decode</button>
                            </div>
                        </div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? "Type text to encode..." : "Paste Base64 to decode..."}
                            className="glass-input"
                            style={{ width: '100%', minHeight: '150px', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}
                        />

                        <button onClick={handleTextConvert} className="glass-button" style={{ alignSelf: 'center', padding: '10px 30px', borderRadius: 'var(--radius-full)' }}>
                            Convert
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div
                            style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', cursor: 'pointer' }}
                            onClick={() => document.getElementById('base64File').click()}
                        >
                            <input type="file" id="base64File" onChange={handleFileUpload} style={{ display: 'none' }} />
                            <FileIcon size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--spacing-md)' }} />
                            <p>Click to upload a file to convert to Base64</p>
                        </div>
                    </div>
                )}

                {/* Output */}
                {output && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <label style={{ fontWeight: 500 }}>Output</label>
                            <button onClick={handleCopy} className="glass-button" style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', gap: '4px' }}>
                                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            className="glass-input"
                            style={{ width: '100%', minHeight: '150px', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)' }}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default Base64Converter;
