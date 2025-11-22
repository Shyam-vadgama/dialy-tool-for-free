import React, { useState, useMemo } from 'react';
import { Divide, Hash } from 'lucide-react';

const FactorCalculator = () => {
    const [number, setNumber] = useState('');

    const calculateFactors = useMemo(() => {
        const num = parseInt(number, 10);
        if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
            return [];
        }

        const factors = new Set();
        for (let i = 1; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                factors.add(i);
                factors.add(num / i);
            }
        }
        return Array.from(factors).sort((a, b) => a - b);
    }, [number]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Factor Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Find all positive factors (divisors) of a given integer.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Number Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Hash size={20} /> Enter a Positive Integer
                        </label>
                        <input
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="e.g., 12, 100"
                            min="1"
                            step="1"
                        />
                    </div>

                    {/* Result */}
                    {number && calculateFactors.length > 0 && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Divide size={20} /> Factors of {number}
                            </h3>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                                {calculateFactors.join(', ')}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                Total: {calculateFactors.length} factors
                            </p>
                        </div>
                    )}
                    {number && calculateFactors.length === 0 && parseInt(number, 10) > 0 && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error-text)', backgroundColor: 'var(--color-error-bg)' }}>
                            <p style={{ color: 'var(--color-error-text)', fontWeight: 'bold' }}>Please enter a valid positive integer.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FactorCalculator;
