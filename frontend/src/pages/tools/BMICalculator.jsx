import React, { useState, useMemo } from 'react';
import { Ruler, Scale, HeartPulse } from 'lucide-react';

const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [unit, setUnit] = useState('metric'); // 'metric' for kg/cm, 'imperial' for lbs/inches

    const calculateBMI = useMemo(() => {
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            return null;
        }

        let bmi;
        if (unit === 'metric') {
            // BMI = weight (kg) / (height (m))^2
            const heightInMeters = h / 100;
            bmi = w / (heightInMeters * heightInMeters);
        } else {
            // BMI = (weight (lbs) / (height (in))^2) * 703
            bmi = (w / (h * h)) * 703;
        }

        return bmi.toFixed(2);
    }, [weight, height, unit]);

    const getBMICategory = useMemo(() => {
        if (!calculateBMI) return '';

        const bmi = parseFloat(calculateBMI);
        if (bmi < 18.5) {
            return 'Underweight';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            return 'Normal weight';
        } else if (bmi >= 25 && bmi < 29.9) {
            return 'Overweight';
        } else {
            return 'Obesity';
        }
    }, [calculateBMI]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>BMI Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Calculate your Body Mass Index (BMI) to assess your weight category.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Unit Selection */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Units
                        </label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            <option value="metric">Metric (kg, cm)</option>
                            <option value="imperial">Imperial (lbs, inches)</option>
                        </select>
                    </div>

                    {/* Weight Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Scale size={20} /> Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder={`Enter weight in ${unit === 'metric' ? 'kilograms' : 'pounds'}`}
                        />
                    </div>

                    {/* Height Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Ruler size={20} /> Height ({unit === 'metric' ? 'cm' : 'inches'})
                        </label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder={`Enter height in ${unit === 'metric' ? 'centimeters' : 'inches'}`}
                        />
                    </div>

                    {/* Result */}
                    {calculateBMI && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <HeartPulse size={20} /> Your BMI
                            </h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                {calculateBMI}
                            </p>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                Category: <span style={{ fontWeight: 'bold' }}>{getBMICategory}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BMICalculator;
