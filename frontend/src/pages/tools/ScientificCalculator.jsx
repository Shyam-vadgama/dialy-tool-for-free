import React, { useState } from 'react';
import { Sigma, Calculator } from 'lucide-react';

const ScientificCalculator = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handleButtonClick = (value) => {
        if (value === '=') {
            try {
                // Replace math functions with Math. equivalents
                let evalString = input
                    .replace(/sin\(([^)]*)\)/g, (match, p1) => `Math.sin(${eval(p1) * Math.PI / 180})`) // Convert degrees to radians
                    .replace(/cos\(([^)]*)\)/g, (match, p1) => `Math.cos(${eval(p1) * Math.PI / 180})`) // Convert degrees to radians
                    .replace(/tan\(([^)]*)\)/g, (match, p1) => `Math.tan(${eval(p1) * Math.PI / 180})`) // Convert degrees to radians
                    .replace(/log\(([^)]*)\)/g, (match, p1) => `Math.log10(${eval(p1)})`) // Base 10 log
                    .replace(/ln\(([^)]*)\)/g, (match, p1) => `Math.log(${eval(p1)})`) // Natural log
                    .replace(/sqrt\(([^)]*)\)/g, (match, p1) => `Math.sqrt(${eval(p1)})`)
                    .replace(/\^/g, '**'); // Power operator

                // Evaluate the string
                setResult(eval(evalString).toString());
            } catch (e) {
                setResult('Error');
            }
        } else if (value === 'C') {
            setInput('');
            setResult('');
        } else if (value === 'DEL') {
            setInput(input.slice(0, -1));
        } else {
            setInput(input + value);
        }
    };

    const buttons = [
        'C', 'DEL', '^', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '=', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', '(', ')', 'PI'
    ];

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Scientific Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Perform basic and scientific calculations.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
                    {/* Display */}
                    <input
                        type="text"
                        className="glass-input"
                        style={{
                            gridColumn: 'span 4',
                            height: '60px',
                            fontSize: '2rem',
                            textAlign: 'right',
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            color: 'var(--accent-primary)'
                        }}
                        value={result || input}
                        readOnly
                    />
                    
                    {/* Buttons */}
                    {buttons.map((btn) => (
                        <button
                            key={btn}
                            onClick={() => handleButtonClick(btn)}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-md)',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 'var(--radius-md)',
                                gridColumn: (btn === '=' || btn === '0' ) ? 'span 2' : 'span 1'
                            }}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;
