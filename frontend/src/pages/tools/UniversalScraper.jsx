import React, { useState } from 'react';
import { Search, Film, Smartphone, FileText, Image, Globe } from 'lucide-react';

const UniversalScraper = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('general');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'movie', label: 'Movie' },
        { value: 'app', label: 'App' },
        { value: 'pdf', label: 'PDF' },
        { value: 'image', label: 'Image' },
    ];

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setResults([]);
        try {
            const response = await fetch(`http://localhost:8000/api/search/universal?query=${encodeURIComponent(query)}&category=${category}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to perform search');
            }
            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Universal Scraper</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Search the web for movies, apps, PDFs, images, and more.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* Search Input and Category */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                        <div style={{ flex: 3 }}>
                            <label className="input-label">Search Query</label>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                                placeholder="e.g., Chhaava movie, Machine Learning PDF"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="glass-button"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-xl)',
                                borderRadius: 'var(--radius-md)',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}
                            disabled={loading || !query.trim()}
                        >
                            {loading ? 'Searching...' : <><Search size={18} /> Search</>}
                        </button>
                    </div>

                    {/* Search Results */}
                    {error && (
                        <div style={{ color: 'var(--color-error-text)', backgroundColor: 'var(--color-error-bg)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                            <p>{error}</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="glass-panel" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            {results.map((item, index) => (
                                <div key={index} style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {item.title || 'No Title'}
                                    </a>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-xs)' }}>
                                        {item.description || 'No description available.'}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                        {item.link}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.length === 0 && !loading && !error && query.trim() && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No results found. Try a different query or category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversalScraper;
