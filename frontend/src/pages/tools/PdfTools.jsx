import React, { useState } from 'react';
import { Upload, FileText, Layers, Scissors, Download, Loader2, X } from 'lucide-react';

const PdfTools = () => {
    const [activeTab, setActiveTab] = useState('merge');

    // Merge State
    const [mergeFiles, setMergeFiles] = useState([]);
    const [merging, setMerging] = useState(false);

    // Extract State
    const [extractFile, setExtractFile] = useState(null);
    const [pageRange, setPageRange] = useState('');
    const [extracting, setExtracting] = useState(false);

    // Merge Handlers
    const handleMergeFileChange = (e) => {
        const files = Array.from(e.target.files);
        setMergeFiles(prev => [...prev, ...files]);
    };

    const removeMergeFile = (index) => {
        setMergeFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleMerge = async () => {
        if (mergeFiles.length < 2) return;

        setMerging(true);
        const formData = new FormData();
        mergeFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8000/pdf/merge', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Merge failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Failed to merge PDFs. Please try again.');
        } finally {
            setMerging(false);
        }
    };

    // Extract Handlers
    const handleExtractFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setExtractFile(file);
    };

    const handleExtract = async () => {
        if (!extractFile || !pageRange) return;

        setExtracting(true);
        const formData = new FormData();
        formData.append('file', extractFile);
        formData.append('pages', pageRange);

        try {
            const response = await fetch('http://localhost:8000/pdf/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Extraction failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'extracted.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error extracting pages:', error);
            alert('Failed to extract pages. Please try again.');
        } finally {
            setExtracting(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>PDF Tools</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Merge, split, and manipulate PDF files.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    onClick={() => setActiveTab('merge')}
                    className={`glass-button ${activeTab !== 'merge' ? 'inactive' : ''}`}
                    style={{
                        background: activeTab === 'merge' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        boxShadow: activeTab === 'merge' ? '0 0 10px var(--accent-glow)' : 'none',
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}
                >
                    <Layers size={18} /> Merge PDFs
                </button>
                <button
                    onClick={() => setActiveTab('extract')}
                    className={`glass-button ${activeTab !== 'extract' ? 'inactive' : ''}`}
                    style={{
                        background: activeTab === 'extract' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        boxShadow: activeTab === 'extract' ? '0 0 10px var(--accent-glow)' : 'none',
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}
                >
                    <Scissors size={18} /> Extract Pages
                </button>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', minHeight: '400px' }}>

                {/* MERGE TAB */}
                {activeTab === 'merge' && (
                    <div className="fade-in">
                        <div
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: 'var(--spacing-lg)',
                                background: 'rgba(0,0,0,0.1)'
                            }}
                            onClick={() => document.getElementById('mergeInput').click()}
                        >
                            <input
                                type="file"
                                id="mergeInput"
                                accept=".pdf"
                                multiple
                                onChange={handleMergeFileChange}
                                style={{ display: 'none' }}
                            />
                            <Layers size={32} color="var(--text-muted)" style={{ marginBottom: 'var(--spacing-sm)' }} />
                            <p>Click to add PDF files</p>
                        </div>

                        {mergeFiles.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
                                {mergeFiles.map((file, index) => (
                                    <div key={index} className="glass-card" style={{
                                        padding: 'var(--spacing-md)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <FileText size={20} color="var(--accent-primary)" />
                                            <span>{file.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeMergeFile(index)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', padding: '4px' }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleMerge}
                                disabled={mergeFiles.length < 2 || merging}
                                className="glass-button"
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-xl)',
                                    borderRadius: 'var(--radius-md)',
                                    opacity: (mergeFiles.length < 2 || merging) ? 0.5 : 1,
                                    cursor: (mergeFiles.length < 2 || merging) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)'
                                }}
                            >
                                {merging ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                Merge Files
                            </button>
                        </div>
                    </div>
                )}

                {/* EXTRACT TAB */}
                {activeTab === 'extract' && (
                    <div className="fade-in">
                        <div
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: 'var(--spacing-lg)',
                                background: extractFile ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0,0,0,0.1)'
                            }}
                            onClick={() => document.getElementById('extractInput').click()}
                        >
                            <input
                                type="file"
                                id="extractInput"
                                accept=".pdf"
                                onChange={handleExtractFileChange}
                                style={{ display: 'none' }}
                            />
                            {extractFile ? (
                                <div>
                                    <FileText size={32} color="var(--accent-primary)" style={{ marginBottom: 'var(--spacing-sm)' }} />
                                    <p style={{ fontWeight: 500 }}>{extractFile.name}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Click to change</p>
                                </div>
                            ) : (
                                <div>
                                    <Scissors size={32} color="var(--text-muted)" style={{ marginBottom: 'var(--spacing-sm)' }} />
                                    <p>Click to upload PDF</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                Pages to Extract (e.g., "1, 3-5, 8")
                            </label>
                            <input
                                type="text"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder="1, 3-5"
                                className="glass-input"
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleExtract}
                                disabled={!extractFile || !pageRange || extracting}
                                className="glass-button"
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-xl)',
                                    borderRadius: 'var(--radius-md)',
                                    opacity: (!extractFile || !pageRange || extracting) ? 0.5 : 1,
                                    cursor: (!extractFile || !pageRange || extracting) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)'
                                }}
                            >
                                {extracting ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                Extract Pages
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PdfTools;
