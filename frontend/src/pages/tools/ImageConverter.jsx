import React, { useState } from 'react';
import { Upload, Download, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageConverter = () => {
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState('PNG');
    const [converting, setConverting] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleConvert = async () => {
        if (!file) return;

        setConverting(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);

        try {
            const response = await fetch('http://localhost:8000/converters/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted.${format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error converting image:', error);
            alert('Failed to convert image. Please try again.');
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Image Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert your images to PNG, JPG, WEBP, and more.</p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', maxWidth: '800px', margin: '0 auto' }}>

                {/* Upload Area */}
                <div
                    style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        background: file ? 'rgba(0,0,0,0.2)' : 'transparent'
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {preview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}
                            />
                            <p style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click to change file</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Upload size={32} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Click to upload or drag and drop</p>
                                <p style={{ color: 'var(--text-muted)' }}>SVG, PNG, JPG or GIF (max. 800x400px)</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{
                    marginTop: 'var(--spacing-xl)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <label htmlFor="format" style={{ color: 'var(--text-secondary)' }}>Convert to:</label>
                        <select
                            id="format"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="glass-input"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                minWidth: '120px'
                            }}
                        >
                            <option value="PNG">PNG</option>
                            <option value="JPG">JPG</option>
                            <option value="WEBP">WEBP</option>
                            <option value="BMP">BMP</option>
                            <option value="ICO">ICO</option>
                        </select>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={!file || converting}
                        className="glass-button"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-xl)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            opacity: (!file || converting) ? 0.7 : 1,
                            cursor: (!file || converting) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {converting ? (
                            <>
                                <Loader2 size={20} className="spin" /> Converting...
                            </>
                        ) : (
                            <>
                                <Download size={20} /> Convert & Download
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

// Add spin animation for loader
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);

export default ImageConverter;
