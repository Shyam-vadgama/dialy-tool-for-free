import React, { useState, useMemo } from 'react';
import { Hash, ArrowRightLeft } from 'lucide-react'; // Using Hash for hexadecimal icon

const HexadecimalConverter = () => {
    const [decimalInput, setDecimalInput] = useState('');
    const [hexInput, setHexInput] = useState('');

    const handleDecimalChange = (e) => {
        const value = e.target.value;
        setDecimalInput(value);
        if (value === '') {
            setHexInput('');
        } else {
            const decimal = parseInt(value, 10);
            if (!isNaN(decimal)) {
                setHexInput(decimal.toString(16).toUpperCase());
            } else {
                setHexInput('Invalid Input');
            }
        }
    };

    const handleHexChange = (e) => {
        const value = e.target.value;
        // Allow only 0-9, A-F, a-f
        if (!/^[0-9a-fA-F]*$/.test(value)) {
            return;
        }
        setHexInput(value);
        if (value === '') {
            setDecimalInput('');
        } else {
            const hex = value;
            if (/^[0-9a-fA-F]+$/.test(hex)) {
                setDecimalInput(parseInt(hex, 16).toString(10));
            } else {
                setDecimalInput('Invalid Input');
            }
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Hexadecimal Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert decimal numbers to hexadecimal and hexadecimal numbers to decimal.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Decimal Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Decimal
                        </label>
                        <input
                            type="text"
                            value={decimalInput}
                            onChange={handleDecimalChange}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="Enter decimal number"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ArrowRightLeft size={24} color="var(--text-secondary)" />
                    </div>

                    {/* Hexadecimal Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Hexadecimal
                        </label>
                        <input
                            type="text"
                            value={hexInput}
                            onChange={handleHexChange}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="Enter hexadecimal number"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HexadecimalConverter;
