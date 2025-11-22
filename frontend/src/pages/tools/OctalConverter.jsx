import React, { useState, useMemo } from 'react';
import { Octagon, ArrowRightLeft } from 'lucide-react';

const OctalConverter = () => {
    const [decimalInput, setDecimalInput] = useState('');
    const [octalInput, setOctalInput] = useState('');

    const handleDecimalChange = (e) => {
        const value = e.target.value;
        setDecimalInput(value);
        if (value === '') {
            setOctalInput('');
        } else {
            const decimal = parseInt(value, 10);
            if (!isNaN(decimal)) {
                setOctalInput(decimal.toString(8));
            } else {
                setOctalInput('Invalid Input');
            }
        }
    };

    const handleOctalChange = (e) => {
        const value = e.target.value;
        // Allow only 0-7
        if (!/^[0-7]*$/.test(value)) {
            return;
        }
        setOctalInput(value);
        if (value === '') {
            setDecimalInput('');
        } else {
            const octal = value;
            if (/^[0-7]+$/.test(octal)) {
                setDecimalInput(parseInt(octal, 8).toString(10));
            } else {
                setDecimalInput('Invalid Input');
            }
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Octal Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert decimal numbers to octal and octal numbers to decimal.</p>
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

                    {/* Octal Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Octal
                        </label>
                        <input
                            type="text"
                            value={octalInput}
                            onChange={handleOctalChange}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="Enter octal number"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OctalConverter;
