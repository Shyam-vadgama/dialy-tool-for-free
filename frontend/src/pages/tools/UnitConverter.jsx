import React, { useState, useMemo } from 'react';
import { Ruler, Thermometer, Weight, ArrowRightLeft } from 'lucide-react';

const UnitConverter = () => {
    const [category, setCategory] = useState('length');
    const [inputValue, setInputValue] = useState('');
    const [fromUnit, setFromUnit] = useState('');
    const [toUnit, setToUnit] = useState('');
    const [outputValue, setOutputValue] = useState('');

    const unitDefinitions = useMemo(() => ({
        length: {
            units: ['meters', 'kilometers', 'centimeters', 'millimeters', 'micrometers', 'nanometers', 'miles', 'yards', 'feet', 'inches', 'nautical miles'],
            conversions: {
                meters: {
                    kilometers: val => val / 1000,
                    centimeters: val => val * 100,
                    millimeters: val => val * 1000,
                    micrometers: val => val * 1_000_000,
                    nanometers: val => val * 1_000_000_000,
                    miles: val => val / 1609.34,
                    yards: val => val / 0.9144,
                    feet: val => val / 0.3048,
                    inches: val => val / 0.0254,
                    'nautical miles': val => val / 1852,
                    meters: val => val
                }
            }
        },
        mass: {
            units: ['kilograms', 'grams', 'milligrams', 'pounds', 'ounces', 'tons (metric)'],
            conversions: {
                kilograms: {
                    grams: val => val * 1000,
                    milligrams: val => val * 1_000_000,
                    pounds: val => val * 2.20462,
                    ounces: val => val * 35.274,
                    'tons (metric)': val => val / 1000,
                    kilograms: val => val
                }
            }
        },
        temperature: {
            units: ['celsius', 'fahrenheit', 'kelvin'],
            conversions: {
                celsius: {
                    fahrenheit: val => (val * 9/5) + 32,
                    kelvin: val => val + 273.15,
                    celsius: val => val
                },
                fahrenheit: {
                    celsius: val => (val - 32) * 5/9,
                    kelvin: val => ((val - 32) * 5/9) + 273.15,
                    fahrenheit: val => val
                },
                kelvin: {
                    celsius: val => val - 273.15,
                    fahrenheit: val => ((val - 273.15) * 9/5) + 32,
                    kelvin: val => val
                }
            }
        }
    }), []);

    useEffect(() => {
        // Set default units when category changes
        if (unitDefinitions[category]) {
            setFromUnit(unitDefinitions[category].units[0]);
            setToUnit(unitDefinitions[category].units[1] || unitDefinitions[category].units[0]);
            setInputValue('');
            setOutputValue('');
        }
    }, [category, unitDefinitions]);

    useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || !fromUnit || !toUnit || !unitDefinitions[category]) {
            setOutputValue('');
            return;
        }

        let result;
        if (fromUnit === toUnit) {
            result = value;
        } else {
            const convertFromBase = (val, from, to) => {
                // All conversions are defined from the first unit in the category (e.g., meters, kilograms, celsius)
                // Convert 'from' unit to base unit
                let baseValue;
                if (category === 'length' || category === 'mass') {
                     // Find a path to the base unit (first in units array)
                    const baseUnit = unitDefinitions[category].units[0];
                    if (unitDefinitions[category].conversions[baseUnit][from]) {
                        baseValue = value / unitDefinitions[category].conversions[baseUnit][from](1); // Inverse conversion
                    } else {
                        baseValue = value; // Assume it is the base unit
                    }
                } else if (category === 'temperature') {
                    // For temperature, conversions are more direct
                    baseValue = unitDefinitions[category].conversions[from][unitDefinitions[category].units[0]](value);
                }


                // Convert from base unit to 'to' unit
                if (unitDefinitions[category].conversions[baseUnit][to]) {
                    return unitDefinitions[category].conversions[baseUnit][to](baseValue);
                }
                return baseValue; // Should not happen with defined conversions
            }

            // A more robust conversion logic is needed here.
            // For now, let's assume direct conversion if available, else convert to a common base then to target.
            // This needs to be done carefully for each category.

            if (unitDefinitions[category].conversions[from] && unitDefinitions[category].conversions[from][to]) {
                result = unitDefinitions[category].conversions[from][to](value);
            } else {
                // If direct conversion isn't defined, convert to category's base unit, then to target
                const baseUnit = unitDefinitions[category].units[0]; // e.g., meters, kilograms, celsius
                let valueInBase;

                // Convert fromUnit to baseUnit
                if (fromUnit === baseUnit) {
                    valueInBase = value;
                } else if (unitDefinitions[category].conversions[fromUnit] && unitDefinitions[category].conversions[fromUnit][baseUnit]) {
                     valueInBase = unitDefinitions[category].conversions[fromUnit][baseUnit](value);
                } else if (unitDefinitions[category].conversions[baseUnit] && unitDefinitions[category].conversions[baseUnit][fromUnit]) {
                    // Inverse conversion if base -> from is defined
                    valueInBase = value / unitDefinitions[category].conversions[baseUnit][fromUnit](1);
                } else {
                    // This scenario needs more robust handling for complex unit systems
                    setOutputValue('Conversion Not Supported');
                    return;
                }

                // Convert from baseUnit to toUnit
                if (toUnit === baseUnit) {
                    result = valueInBase;
                } else if (unitDefinitions[category].conversions[baseUnit] && unitDefinitions[category].conversions[baseUnit][toUnit]) {
                    result = unitDefinitions[category].conversions[baseUnit][toUnit](valueInBase);
                } else {
                    setOutputValue('Conversion Not Supported');
                    return;
                }
            }
        }
        setOutputValue(result.toFixed(4));
    }, [inputValue, fromUnit, toUnit, category, unitDefinitions]);


    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'length': return <Ruler size={20} />;
            case 'mass': return <Weight size={20} />;
            case 'temperature': return <Thermometer size={20} />;
            default: return <Ruler size={20} />;
        }
    }

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Unit Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert values between different units.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Category Selection */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            {Object.keys(unitDefinitions).map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Input Value */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            {getCategoryIcon(category)} Value
                        </label>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="Enter value"
                        />
                    </div>

                    {/* From Unit */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            From Unit
                        </label>
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            {unitDefinitions[category] && unitDefinitions[category].units.map(unit => (
                                <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ArrowRightLeft size={24} color="var(--text-secondary)" />
                    </div>

                    {/* To Unit */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            To Unit
                        </label>
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            {unitDefinitions[category] && unitDefinitions[category].units.map(unit => (
                                <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Output Value */}
                    {outputValue && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                Result
                            </h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                {outputValue} {toUnit.charAt(0).toUpperCase() + toUnit.slice(1)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnitConverter;