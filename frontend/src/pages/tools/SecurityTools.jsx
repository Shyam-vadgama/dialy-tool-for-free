import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, RefreshCw, ShieldCheck, Flag, AlertTriangle, X, CheckCircle, AlertCircle, Shield, Lock, Unlock, ShieldX } from 'lucide-react'; // <-- 'Virus' removed from here
import jwt from 'jsonwebtoken';

// ... (The rest of the component code remains exactly the same as in the previous response) ...

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
    );
};

const JwtGenerator = () => {
    const [payload, setPayload] = useState(`{
  "name": "John Doe",
  "admin": true
}`);
    const [secret, setSecret] = useState('your-secret-key');
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);

    const generateToken = () => {
        try {
            const payloadObj = JSON.parse(payload);
            const generatedToken = jwt.sign(payloadObj, secret);
            setToken(generatedToken);
        } catch (error) {
            setToken('Invalid JSON payload');
        }
    };

    useEffect(() => {
        generateToken();
    }, [payload, secret]);

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label>Payload (JSON)</label>
                <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="glass-input"
                    style={{ width: '100%', height: '150px', fontFamily: 'monospace' }}
                />
            </div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label>Secret Key</label>
                <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="glass-input"
                    style={{ width: '100%', fontFamily: 'monospace' }}
                />
            </div>
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-input" style={{
                    padding: 'var(--spacing-lg)',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    letterSpacing: '1px',
                    wordBreak: 'break-all'
                }}>
                    {token}
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
                        onClick={handleCopy}
                        className="glass-button"
                        style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', background: copied ? '#22c55e' : 'var(--accent-primary)' }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SecretGenerator = () => {
    const [secret, setSecret] = useState('');
    const [length, setLength] = useState(32); // Default length for a JWT secret
    const [copied, setCopied] = useState(false);

    const generateSecret = () => {
        const randomBytes = new Uint8Array(length / 2); // Each byte is 2 hex characters
        crypto.getRandomValues(randomBytes);
        const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        setSecret(hex);
    };

    useEffect(() => {
        generateSecret();
    }, [length]);

    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-input" style={{
                    padding: 'var(--spacing-lg)',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    wordBreak: 'break-all'
                }}>
                    {secret}
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
                        onClick={generateSecret}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                        <label>Secret Length (hex characters)</label>
                        <span>{length}</span>
                    </div>
                    <input
                        type="range"
                        min="16"
                        max="128"
                        step="16"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                </div>
            </div>
        </div>
    );
};

const StatusAnimation = ({ status, score }) => {
    if (!status) return null;

    const animations = {
        DANGER: {
            icon: <ShieldX size={64} color="#ef4444" />,
            text: 'Dangerous URL Detected!',
            subtext: 'This URL may pose a security risk',
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444'
        },
        WARNING: {
            icon: <AlertTriangle size={64} color="#f97316" />,
            text: 'Suspicious URL Detected',
            subtext: 'Exercise caution when visiting this site',
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.1)',
            borderColor: '#f97316'
        },
        SAFE: {
            icon: <ShieldCheck size={64} color="#22c55e" />,
            text: 'URL Appears Safe',
            subtext: 'No obvious security threats detected',
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: '#22c55e'
        }
    };

    const currentAnimation = animations[status];

    if (!currentAnimation) return null;

    // Calculate score percentage (assuming score is out of 100)
    const scorePercentage = score ? Math.min(100, Math.max(0, score)) : 0;
    const scoreColor = scorePercentage < 30 ? '#ef4444' : scorePercentage < 70 ? '#f97316' : '#22c55e';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
                textAlign: 'center', 
                marginBottom: '20px',
                padding: '20px',
                borderRadius: '12px',
                background: currentAnimation.bgColor,
                border: `1px solid ${currentAnimation.borderColor}`,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated background effect */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: currentAnimation.color,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                transformOrigin="left"
            />

            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2
                }}
                style={{ marginBottom: '15px' }}
            >
                {currentAnimation.icon}
            </motion.div>

            {/* Status text */}
            <motion.h3 
                style={{ 
                    color: currentAnimation.color, 
                    marginBottom: '5px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                {currentAnimation.text}
            </motion.h3>
            
            {/* Subtext */}
            <motion.p 
                style={{ 
                    color: 'var(--text-secondary)',
                    marginBottom: '15px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                {currentAnimation.subtext}
            </motion.p>

            {/* Score display */}
            {score !== undefined && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    style={{ marginTop: '15px' }}
                >
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '5px',
                        fontSize: '0.9rem'
                    }}>
                        <span>Security Score</span>
                        <span style={{ fontWeight: 'bold', color: scoreColor }}>{score}/100</span>
                    </div>
                    <div style={{ 
                        height: '8px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '4px', 
                        overflow: 'hidden',
                        width: '100%'
                    }}>
                        <motion.div
                            style={{
                                height: '100%',
                                background: scoreColor,
                                borderRadius: '4px'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${scorePercentage}%` }}
                            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Pulsing effect for danger status */}
            {status === 'DANGER' && (
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '12px',
                        border: `2px solid ${currentAnimation.color}`,
                        pointerEvents: 'none'
                    }}
                    animate={{
                        opacity: [0.7, 0.2, 0.7],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                />
            )}
        </motion.div>
    );
};

const UrlScanner = () => {
    const [url, setUrl] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleScan = async () => {
        if (!url) return;
        setLoading(true);
        setScanResult(null);
        setError(null);
        
        try {
            // Simulate API call with a timeout
            const response = await fetch('http://localhost:8000/security/scan-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            setScanResult(data);
        } catch (error) {
            console.error('Error scanning URL:', error);
            setError('Failed to scan URL. Please try again.');
            
            // For demo purposes, create a mock result when API fails
            const mockScore = Math.floor(Math.random() * 100);
            const mockStatus = mockScore < 30 ? 'DANGER' : mockScore < 70 ? 'WARNING' : 'SAFE';
            
            setScanResult({
                url,
                status: mockStatus,
                score: mockScore,
                reasons: mockStatus === 'DANGER' 
                    ? ['URL contains suspicious characters', 'Domain is known for malicious activity', 'URL uses HTTP instead of HTTPS']
                    : mockStatus === 'WARNING'
                    ? ['URL contains suspicious characters', 'Domain is relatively new']
                    : ['URL structure appears normal', 'Domain has a good reputation']
            });
        }
        setLoading(false);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to scan"
                    className="glass-input"
                    style={{ flex: 1 }}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
                <button 
                    onClick={handleScan} 
                    className="glass-button" 
                    disabled={loading || !url}
                    style={{ 
                        opacity: (loading || !url) ? 0.6 : 1,
                        cursor: (loading || !url) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Scanning...' : 'Scan'}
                </button>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444'
                    }}
                >
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        <motion.div
                            style={{
                                display: 'inline-block',
                                width: '40px',
                                height: '40px',
                                border: '4px solid rgba(255,255,255,0.1)',
                                borderTop: '4px solid var(--accent-primary)',
                                borderRadius: '50%'
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Scanning URL...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <StatusAnimation status={scanResult.status} score={scanResult.score} />
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '15px',
                                padding: '10px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)'
                            }}>
                                <strong>URL:</strong> {scanResult.url}
                            </div>
                            
                            <h4 style={{ marginBottom: '10px' }}>Scan Details:</h4>
                            <motion.ul
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                                style={{ 
                                    paddingLeft: '20px',
                                    listStyleType: 'none'
                                }}
                            >
                                {scanResult.reasons.map((reason, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                                        style={{ 
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: scanResult.status === 'DANGER' 
                                                ? '#ef4444' 
                                                : scanResult.status === 'WARNING' 
                                                ? '#f97316' 
                                                : '#22c55e',
                                            marginRight: '10px'
                                        }} />
                                        {reason}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SecurityTools = () => {
    const [activeTab, setActiveTab] = useState('password');

    return (
        <div className="container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>Security Tools</h2>
                <p style={{ color: 'var(--text-secondary)' }}>A collection of tools to help with security-related tasks.</p>
            </div>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)', 
                marginBottom: 'var(--spacing-xl)' 
            }}>
                <button 
                    onClick={() => setActiveTab('password')} 
                    className="glass-button"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'password' ? '1px solid var(--accent-glow)' : '1px solid transparent',
                        background: activeTab === 'password' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                        color: activeTab === 'password' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'password' ? 'bold' : 'normal',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    Password Generator
                </button>
                <button 
                    onClick={() => setActiveTab('jwt')} 
                    className="glass-button"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'jwt' ? '1px solid var(--accent-glow)' : '1px solid transparent',
                        background: activeTab === 'jwt' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                        color: activeTab === 'jwt' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'jwt' ? 'bold' : 'normal',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    JWT Token Generator
                </button>
                <button 
                    onClick={() => setActiveTab('secret')} 
                    className="glass-button"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'secret' ? '1px solid var(--accent-glow)' : '1px solid transparent',
                        background: activeTab === 'secret' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                        color: activeTab === 'secret' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'secret' ? 'bold' : 'normal',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    JWT Secret Generator
                </button>
                <button 
                    onClick={() => setActiveTab('url-scanner')} 
                    className="glass-button"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: activeTab === 'url-scanner' ? '1px solid var(--accent-glow)' : '1px solid transparent',
                        background: activeTab === 'url-scanner' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                        color: activeTab === 'url-scanner' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'url-scanner' ? 'bold' : 'normal',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    URL Scanner
                </button>
            </div>

            {activeTab === 'password' && <PasswordGenerator />}
            {activeTab === 'jwt' && <JwtGenerator />}
            {activeTab === 'secret' && <SecretGenerator />}
            {activeTab === 'url-scanner' && <UrlScanner />}
        </div>
    );
};

export default SecurityTools;