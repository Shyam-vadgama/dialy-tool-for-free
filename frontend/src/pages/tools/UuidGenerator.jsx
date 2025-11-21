import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Copy, Check, RefreshCw, Layers } from 'lucide-react';

const UuidGenerator = () => {
    const [uuids, setUuids] = useState([]);
    const [count, setCount] = useState(1);
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const newUuids = Array.from({ length: count }, () => uuidv4());
        setUuids(newUuids);
    };

    // Generate on first load
    React.useEffect(() => {
        generate();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(uuids.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>UUID Generator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Generate random Version 4 UUIDs.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'end', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>Quantity</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={count}
                            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>
                    <button
                        onClick={generate}
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

                {/* Output List */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)'
                }}>
                    {uuids.map((uuid, index) => (
                        <div
                            key={index}
                            style={{
                                padding: 'var(--spacing-md)',
                                fontFamily: 'monospace',
                                fontSize: '1.1rem',
                                borderBottom: index < uuids.length - 1 ? '1px solid var(--border-color)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)'
                            }}
                        >
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '30px' }}>{index + 1}.</span>
                            <span style={{ color: 'var(--accent-primary)' }}>{uuid}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default UuidGenerator;
