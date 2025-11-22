import React, { useState, useMemo } from 'react';
import { CalendarDays, PlusSquare, MinusSquare, ArrowRight } from 'lucide-react';
import { differenceInDays, differenceInMonths, differenceInYears, addDays, subDays, addMonths, subMonths, addYears, subYears, format } from 'date-fns';

const DateCalculator = () => {
    const [mode, setMode] = useState('difference'); // 'difference' or 'addSubtract'

    // State for Date Difference mode
    const [startDateDiff, setStartDateDiff] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDateDiff, setEndDateDiff] = useState(format(new Date(), 'yyyy-MM-dd'));

    // State for Add/Subtract mode
    const [baseDate, setBaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [value, setValue] = useState(1);
    const [unit, setUnit] = useState('days'); // 'days', 'months', 'years'
    const [operation, setOperation] = useState('add'); // 'add' or 'subtract'

    const calculateDifference = useMemo(() => {
        if (!startDateDiff || !endDateDiff) return null;

        const start = new Date(startDateDiff);
        const end = new Date(endDateDiff);

        if (start > end) return null; // Ensure start date is not after end date for meaningful diff

        const years = differenceInYears(end, start);
        const months = differenceInMonths(end, addYears(start, years));
        const days = differenceInDays(end, addMonths(addYears(start, years), months));

        return { years, months, days };
    }, [startDateDiff, endDateDiff]);

    const calculateAddSubtract = useMemo(() => {
        if (!baseDate || isNaN(value)) return null;

        const base = new Date(baseDate);
        let resultDate = base;

        if (operation === 'add') {
            if (unit === 'days') resultDate = addDays(base, value);
            if (unit === 'months') resultDate = addMonths(base, value);
            if (unit === 'years') resultDate = addYears(base, value);
        } else {
            if (unit === 'days') resultDate = subDays(base, value);
            if (unit === 'months') resultDate = subMonths(base, value);
            if (unit === 'years') resultDate = subYears(base, value);
        }

        return format(resultDate, 'yyyy-MM-dd');
    }, [baseDate, value, unit, operation]);


    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Date Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Calculate date differences or add/subtract time from a date.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                {/* Mode Selector */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-xl)', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={() => setMode('difference')}
                        className={`glass-button ${mode === 'difference' ? 'active' : ''}`}
                        style={{ padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}
                    >
                        Date Difference
                    </button>
                    <button
                        onClick={() => setMode('addSubtract')}
                        className={`glass-button ${mode === 'addSubtract' ? 'active' : ''}`}
                        style={{ padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}
                    >
                        Add / Subtract
                    </button>
                </div>

                {/* Date Difference Mode */}
                {mode === 'difference' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <CalendarDays size={20} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={startDateDiff}
                                onChange={(e) => setStartDateDiff(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <CalendarDays size={20} /> End Date
                            </label>
                            <input
                                type="date"
                                value={endDateDiff}
                                onChange={(e) => setEndDateDiff(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        {calculateDifference && (
                            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    Difference <ArrowRight size={20} />
                                </h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                    {calculateDifference.years} Years, {calculateDifference.months} Months, {calculateDifference.days} Days
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Subtract Mode */}
                {mode === 'addSubtract' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <CalendarDays size={20} /> Base Date
                            </label>
                            <input
                                type="date"
                                value={baseDate}
                                onChange={(e) => setBaseDate(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Value</label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                                    className="glass-input"
                                    style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Unit</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="glass-input"
                                    style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                                >
                                    <option value="days">Days</option>
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Operation</label>
                                <select
                                    value={operation}
                                    onChange={(e) => setOperation(e.target.value)}
                                    className="glass-input"
                                    style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                                >
                                    <option value="add">Add</option>
                                    <option value="subtract">Subtract</option>
                                </select>
                            </div>
                        </div>
                        {calculateAddSubtract && (
                            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    Result <ArrowRight size={20} />
                                </h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                    {calculateAddSubtract}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateCalculator;
