import React, { useState, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Loader2, Maximize, Move } from 'lucide-react';

const ImageResizer = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [resizing, setResizing] = useState(false);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);

            // Get original dimensions
            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ width: img.width, height: img.height });
                setWidth(img.width);
                setHeight(img.height);
            };
            img.src = objectUrl;
        }
    };

    const handleWidthChange = (e) => {
        const newWidth = parseInt(e.target.value) || 0;
        setWidth(newWidth);
        if (maintainAspectRatio && originalDimensions.width > 0) {
            const ratio = originalDimensions.height / originalDimensions.width;
            setHeight(Math.round(newWidth * ratio));
        }
    };

    const handleHeightChange = (e) => {
        const newHeight = parseInt(e.target.value) || 0;
        setHeight(newHeight);
        if (maintainAspectRatio && originalDimensions.height > 0) {
            const ratio = originalDimensions.width / originalDimensions.height;
            setWidth(Math.round(newHeight * ratio));
        }
    };

    const applyPreset = (w, h) => {
        setWidth(w);
        setHeight(h);
    };

    const handleResize = async () => {
        if (!file) return;

        setResizing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('width', width);
        formData.append('height', height);

        try {
            const response = await fetch('http://localhost:8000/image/resize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Resize failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resized_${width}x${height}_${file.name}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error resizing image:', error);
            alert('Failed to resize image. Please try again.');
        } finally {
            setResizing(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Image Resizer</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Resize your images by pixel or percentage. High quality output.</p>
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
                        background: file ? 'rgba(0,0,0,0.2)' : 'transparent',
                        marginBottom: 'var(--spacing-xl)'
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
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Original: {originalDimensions.width} x {originalDimensions.height}</p>
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
                                <p style={{ color: 'var(--text-muted)' }}>JPG, PNG, WEBP (max 10MB)</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {file && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        
                        {/* Dimensions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Width (px)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={handleWidthChange}
                                    className="glass-input"
                                    style={{ width: '100%', padding: 'var(--spacing-sm)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Height (px)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={handleHeightChange}
                                    className="glass-input"
                                    style={{ width: '100%', padding: 'var(--spacing-sm)' }}
                                />
                            </div>
                        </div>

                        {/* Aspect Ratio Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input 
                                type="checkbox" 
                                id="aspectRatio" 
                                checked={maintainAspectRatio} 
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="aspectRatio" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>Maintain Aspect Ratio</label>
                        </div>

                        {/* Presets */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Common Sizes:</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                {[128, 256, 512, 1024, 1920].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => applyPreset(size, size)}
                                        className="glass-button"
                                        style={{
                                            padding: 'var(--spacing-xs) var(--spacing-md)',
                                            fontSize: '0.9rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        {size}x{size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
                            <button
                                onClick={handleResize}
                                disabled={resizing}
                                className="glass-button"
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-xl)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    border: 'none',
                                    opacity: resizing ? 0.7 : 1,
                                    cursor: resizing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {resizing ? (
                                    <>
                                        <Loader2 size={20} className="spin" /> Resizing...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} /> Resize & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

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

export default ImageResizer;
