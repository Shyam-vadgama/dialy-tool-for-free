import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const ColorTools = () => {
    const [color, setColor] = useState('#3b82f6');
    const [rgb, setRgb] = useState('');
    const [hsl, setHsl] = useState('');
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        // Convert HEX to RGB
        let hex = color.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        setRgb(`rgb(${r}, ${g}, ${b})`);

        // Convert RGB to HSL
        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
                default: break;
            }
            h /= 6;
        }
        setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
    }, [color]);

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Color Tools</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Pick colors, convert formats, and generate palettes.</p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>

                {/* Picker */}
                <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', flex: 1, minWidth: '300px' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', fontWeight: 500 }}>Pick a Color</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                cursor: 'pointer',
                                background: 'transparent'
                            }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { label: 'HEX', value: color },
                                { label: 'RGB', value: rgb },
                                { label: 'HSL', value: hsl }
                            ].map((item) => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <span style={{ width: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.label}</span>
                                    <div className="glass-input" style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                        {item.value}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(item.value, item.label)}
                                        className="glass-button"
                                        style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
                                    >
                                        {copied === item.label ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Palette */}
                <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', flex: 1, minWidth: '300px' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', fontWeight: 500 }}>Shades & Tints</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {[0.9, 0.7, 0.5, 0.3, 0.1, 0, -0.1, -0.3, -0.5, -0.7].map((opacity, i) => (
                            <div
                                key={i}
                                style={{
                                    height: '40px',
                                    background: color,
                                    filter: opacity > 0 ? `brightness(${1 + opacity})` : `brightness(${1 + opacity})`,
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: opacity > 0.3 ? 'black' : 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                    // Simple RGB extraction for demo
                                    const bg = e.target.style.backgroundColor;
                                    navigator.clipboard.writeText(bg);
                                }}
                            >
                                Click to Copy
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ColorTools;
