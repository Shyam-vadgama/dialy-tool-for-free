import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';

const PasswordGenerator = () => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState('Strong');

    const generatePassword = () => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = '';
        if (options.uppercase) chars += upper;
        if (options.lowercase) chars += lower;
        if (options.numbers) chars += nums;
        if (options.symbols) chars += syms;

        if (!chars) return;

        let generated = '';
        for (let i = 0; i < length; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generated);
        calculateStrength(generated);
    };

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.length > 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) setStrength('Weak');
        else if (score <= 4) setStrength('Medium');
        else setStrength('Strong');
    };

    useEffect(() => {
        generatePassword();
    }, [length, options]);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Password Generator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Generate strong, secure passwords instantly.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>

                {/* Password Display */}
                <div style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                    <div className="glass-input" style={{
                        padding: 'var(--spacing-lg)',
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        borderRadius: 'var(--radius-md)',
                        letterSpacing: '2px',
                        wordBreak: 'break-all'
                    }}>
                        {password}
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: 'var(--spacing-sm)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <button
                            onClick={generatePassword}
                            className="glass-button"
                            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="glass-button"
                            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', background: copied ? '#22c55e' : 'var(--accent-primary)' }}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                {/* Strength Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Strength:</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: strength === 'Weak' ? '33%' : strength === 'Medium' ? '66%' : '100%',
                            background: strength === 'Weak' ? '#ef4444' : strength === 'Medium' ? '#eab308' : '#22c55e',
                            transition: 'all 0.3s ease'
                        }} />
                    </div>
                    <span style={{
                        color: strength === 'Weak' ? '#ef4444' : strength === 'Medium' ? '#eab308' : '#22c55e',
                        fontWeight: 'bold'
                    }}>{strength}</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <label>Password Length</label>
                            <span>{length}</span>
                        </div>
                        <input
                            type="range"
                            min="6"
                            max="64"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        {Object.keys(options).map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={options[opt]}
                                    onChange={() => setOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                                />
                                <span style={{ textTransform: 'capitalize' }}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PasswordGenerator;
