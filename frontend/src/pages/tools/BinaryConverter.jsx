import React, { useState, useMemo } from 'react';
import { Binary, ArrowRightLeft } from 'lucide-react';

const BinaryConverter = () => {
    const [decimalInput, setDecimalInput] = useState('');
    const [binaryInput, setBinaryInput] = useState('');

    const handleDecimalChange = (e) => {
        const value = e.target.value;
        setDecimalInput(value);
        if (value === '') {
            setBinaryInput('');
        } else {
            const decimal = parseInt(value, 10);
            if (!isNaN(decimal)) {
                setBinaryInput(decimal.toString(2));
            } else {
                setBinaryInput('Invalid Input');
            }
        }
    };

    const handleBinaryChange = (e) => {
        const value = e.target.value;
        // Allow only 0s and 1s
        if (!/^[01]*$/.test(value)) {
            return;
        }
        setBinaryInput(value);
        if (value === '') {
            setDecimalInput('');
        } else {
            // Check if input is a valid binary string (starts with 0b for strict parsing, or just 0s and 1s)
            const binary = value;
            if (/^[01]+$/.test(binary)) {
                setDecimalInput(parseInt(binary, 2).toString(10));
            } else {
                setDecimalInput('Invalid Input');
            }
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Binary Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert decimal numbers to binary and binary numbers to decimal.</p>
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

                    {/* Binary Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Binary
                        </label>
                        <input
                            type="text"
                            value={binaryInput}
                            onChange={handleBinaryChange}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="Enter binary number"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinaryConverter;
