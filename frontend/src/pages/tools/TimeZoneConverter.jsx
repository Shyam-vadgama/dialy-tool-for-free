import React, { useState, useMemo } from 'react';
import * as dateFnsTz from 'date-fns-tz';
import { format, toDate } from 'date-fns';
import { Clock, Globe } from 'lucide-react';

const TimeZoneConverter = () => {
    const [sourceDateTime, setSourceDateTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [sourceTimeZone, setSourceTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [targetTimeZone, setTargetTimeZone] = useState('America/New_York');

    const availableTimeZones = useMemo(() => {
        // This is a simplified list. In a real app, you might want to filter/sort or use a more user-friendly list.
        const allZones = Intl.supportedValuesOf('timeZone');
        // Filter out some less common/redundant ones and sort for better UX
        return allZones
            .filter(zone => !zone.startsWith('Etc/') && !zone.startsWith('GMT') && !zone.startsWith('SystemV/'))
            .sort((a, b) => a.localeCompare(b));
    }, []);

    const convertedDateTime = useMemo(() => {
        if (!sourceDateTime || !sourceTimeZone || !targetTimeZone) {
            return '';
        }
        try {
            const date = new Date(sourceDateTime); // This will parse in local time
            const zonedDate = dateFnsTz.utcToZonedTime(date, sourceTimeZone); // Convert local date to source timezone date
            return dateFnsTz.formatInTimeZone(zonedDate, targetTimeZone, "yyyy-MM-dd HH:mm:ss (zzz)");
        } catch (error) {
            console.error("Error converting time:", error);
            return 'Invalid Date/Time or TimeZone';
        }
    }, [sourceDateTime, sourceTimeZone, targetTimeZone]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Time Zone Converter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Convert dates and times between different time zones.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Source Date/Time Input */}
                    <div>
                        <label className="input-label">Source Date and Time</label>
                        <input
                            type="datetime-local"
                            value={sourceDateTime}
                            onChange={(e) => setSourceDateTime(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>

                    {/* Source Time Zone Selector */}
                    <div>
                        <label className="input-label">Source Time Zone</label>
                        <select
                            value={sourceTimeZone}
                            onChange={(e) => setSourceTimeZone(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            {availableTimeZones.map(zone => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Time Zone Selector */}
                    <div>
                        <label className="input-label">Target Time Zone</label>
                        <select
                            value={targetTimeZone}
                            onChange={(e) => setTargetTimeZone(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                        >
                            {availableTimeZones.map(zone => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>
                    </div>

                    {/* Converted Output */}
                    <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <Globe size={20} /> Converted Time
                        </h3>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {convertedDateTime}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeZoneConverter;
