import React, { useState } from 'react';
import { 
    AppWindow, 
    Smartphone, 
    Globe, 
    Download, 
    Upload, 
    Loader2,
    Monitor,
    CheckCircle
} from 'lucide-react';

const WebToApp = () => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        themeColor: '#3b82f6',
        platforms: {
            electron: true,
            pwa: true,
            android: false
        }
    });
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [generating, setGenerating] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformChange = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: {
                ...prev.platforms,
                [platform]: !prev.platforms[platform]
            }
        }));
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!iconFile) {
            alert('Please upload an icon');
            return;
        }

        setGenerating(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('url', formData.url);
        data.append('description', formData.description);
        data.append('theme_color', formData.themeColor);
        
        const selectedPlatforms = Object.keys(formData.platforms).filter(k => formData.platforms[k]);
        data.append('platforms', JSON.stringify(selectedPlatforms));
        data.append('icon', iconFile);

        try {
            const response = await fetch('http://localhost:8000/web-to-app/generate', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) throw new Error('Generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.name.replace(/\s+/g, '_')}_bundle.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating app:', error);
            alert('Failed to generate app bundle. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Web to App Converter
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Turn any website into a Desktop App, PWA, or Mobile Project instantly.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>App Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="My Awesome App"
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Website URL</label>
                            <input
                                type="url"
                                name="url"
                                value={formData.url}
                                onChange={handleInputChange}
                                required
                                placeholder="https://example.com"
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="What does your app do?"
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', minHeight: '80px' }}
                        />
                    </div>

                    {/* Visuals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>Theme Color</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <input
                                    type="color"
                                    name="themeColor"
                                    value={formData.themeColor}
                                    onChange={handleInputChange}
                                    style={{ width: '50px', height: '40px', padding: 0, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    name="themeColor"
                                    value={formData.themeColor}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    style={{ flex: 1, padding: 'var(--spacing-sm)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>App Icon (512x512 recommended)</label>
                            <div 
                                onClick={() => document.getElementById('iconInput').click()}
                                style={{ 
                                    border: '2px dashed var(--border-color)', 
                                    borderRadius: 'var(--radius-md)', 
                                    padding: 'var(--spacing-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)'
                                }}
                            >
                                {iconPreview ? (
                                    <img src={iconPreview} alt="Icon" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Upload size={20} color="var(--text-muted)" />
                                    </div>
                                )}
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {iconFile ? iconFile.name : 'Click to upload PNG/JPG'}
                                </span>
                                <input 
                                    id="iconInput" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleIconChange} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Target Platforms</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                            
                            {/* Electron */}
                            <div 
                                onClick={() => handlePlatformChange('electron')}
                                className={`glass-card ${formData.platforms.electron ? 'active' : ''}`}
                                style={{ 
                                    padding: 'var(--spacing-md)', 
                                    cursor: 'pointer',
                                    border: formData.platforms.electron ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    background: formData.platforms.electron ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                    <Monitor size={20} color={formData.platforms.electron ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                    <span style={{ fontWeight: 600 }}>Desktop (Electron)</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Windows, Mac, Linux executable source code.</p>
                            </div>

                            {/* PWA */}
                            <div 
                                onClick={() => handlePlatformChange('pwa')}
                                className={`glass-card ${formData.platforms.pwa ? 'active' : ''}`}
                                style={{ 
                                    padding: 'var(--spacing-md)', 
                                    cursor: 'pointer',
                                    border: formData.platforms.pwa ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    background: formData.platforms.pwa ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                    <Globe size={20} color={formData.platforms.pwa ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                    <span style={{ fontWeight: 600 }}>Web (PWA)</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Installable web app manifest & icons.</p>
                            </div>

                            {/* Mobile */}
                            <div 
                                onClick={() => handlePlatformChange('android')}
                                className={`glass-card ${formData.platforms.android ? 'active' : ''}`}
                                style={{ 
                                    padding: 'var(--spacing-md)', 
                                    cursor: 'pointer',
                                    border: formData.platforms.android ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    background: formData.platforms.android ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                    <Smartphone size={20} color={formData.platforms.android ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                    <span style={{ fontWeight: 600 }}>Mobile (Capacitor)</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project config for iOS & Android.</p>
                            </div>

                        </div>
                    </div>

                    {/* Action */}
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <button
                            type="submit"
                            disabled={generating}
                            className="glass-button"
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-sm)',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                opacity: generating ? 0.7 : 1
                            }}
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={24} className="spin" /> Generating Bundle...
                                </>
                            ) : (
                                <>
                                    <Download size={24} /> Generate & Download Zip
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);

export default WebToApp;
