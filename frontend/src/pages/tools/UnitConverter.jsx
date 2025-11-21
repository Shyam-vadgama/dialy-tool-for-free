import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const UnitConverter = () => {
    const [category, setCategory] = useState('length');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');
    const [value, setValue] = useState(1);

    const units = {
        length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.34 },
        weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
        temp: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' } // Special handling
    };

    const convert = (val) => {
        if (category === 'temp') {
            if (fromUnit === toUnit) return val;
            let celsius = val;
            if (fromUnit === 'f') celsius = (val - 32) * 5 / 9;
            if (fromUnit === 'k') celsius = val - 273.15;

            if (toUnit === 'c') return celsius;
            if (toUnit === 'f') return (celsius * 9 / 5) + 32;
            if (toUnit === 'k') return celsius + 273.15;
            return val;
        } else {
            const base = val * units[category][fromUnit];
            return base / units[category][toUnit];
        }
    };

    const result = convert(parseFloat(value) || 0);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Unit Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert between common units of measurement.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>

                {/* Category Selector */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
                    {Object.keys(units).map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategory(cat);
                                setFromUnit(Object.keys(units[cat])[0]);
                                setToUnit(Object.keys(units[cat])[1]);
                            }}
                            className="glass-button"
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                background: category === cat ? 'var(--accent-primary)' : 'transparent',
                                textTransform: 'capitalize'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Converter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexDirection: 'column' }}>

                    <div style={{ width: '100%', display: 'flex', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>From</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)' }}
                            />
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)' }}
                            >
                                {Object.keys(units[category]).map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                            <ArrowRightLeft size={24} color="var(--text-muted)" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>To</label>
                            <div className="glass-input" style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-sm)',
                                background: 'rgba(0,0,0,0.3)',
                                minHeight: '42px'
                            }}>
                                {parseFloat(result.toFixed(4))}
                            </div>
                            <select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)' }}
                            >
                                {Object.keys(units[category]).map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UnitConverter;
