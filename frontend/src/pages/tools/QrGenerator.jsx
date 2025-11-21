import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Link as LinkIcon } from 'lucide-react';

const QrGenerator = () => {
    const [text, setText] = useState('https://example.com');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const qrRef = useRef(null);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>QR Code Generator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Create custom QR codes for links, text, and more.</p>
            </div>

            <div className="glass-panel" style={{
                display: 'flex',
                gap: 'var(--spacing-xl)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                flexWrap: 'wrap'
            }}>

                {/* Controls */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Content</label>
                        <div className="glass-input" style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
                            <LinkIcon size={18} style={{ marginRight: 'var(--spacing-sm)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text or URL"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Size ({size}px)</label>
                        <input
                            type="range"
                            min="128"
                            max="512"
                            value={size}
                            onChange={(e) => setSize(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Foreground</label>
                            <input
                                type="color"
                                value={fgColor}
                                onChange={(e) => setFgColor(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Background</label>
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div style={{
                    flex: 1,
                    minWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)'
                }}>
                    <div ref={qrRef} style={{ padding: 'var(--spacing-md)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                        <QRCodeCanvas
                            value={text}
                            size={size}
                            fgColor={fgColor}
                            bgColor={bgColor}
                            level="H"
                            includeMargin={true}
                        />
                    </div>

                    <button
                        onClick={downloadQR}
                        className="glass-button"
                        style={{
                            marginTop: 'var(--spacing-lg)',
                            padding: 'var(--spacing-sm) var(--spacing-xl)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        <Download size={18} /> Download PNG
                    </button>
                </div>

            </div>
        </div>
    );
};

export default QrGenerator;
