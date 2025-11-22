import React, { useState, useMemo } from 'react';
import { Calendar, Gift, Cake } from 'lucide-react';

const AgeCalculator = () => {
    const [birthDate, setBirthDate] = useState('');

    const calculateAge = useMemo(() => {
        if (!birthDate) {
            return { years: 0, months: 0, days: 0 };
        }

        const dob = new Date(birthDate);
        const today = new Date();

        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in previous month
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    }, [birthDate]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Age Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Calculate your age or the age of anything based on a birth date.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Birth Date Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Gift size={20} /> Date of Birth
                        </label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            max={new Date().toISOString().split('T')[0]} // Cannot select a future date
                        />
                    </div>

                    {/* Result */}
                    {birthDate && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Cake size={20} /> Your Age
                            </h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                {calculateAge.years} Years, {calculateAge.months} Months, and {calculateAge.days} Days
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgeCalculator;
