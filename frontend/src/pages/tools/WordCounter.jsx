import React, { useState, useMemo } from 'react';
import { BookOpen, Pilcrow, CaseSensitive, WrapText } from 'lucide-react';

const WordCounter = () => {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        if (!text) {
            return {
                words: 0,
                characters: 0,
                sentences: 0,
                paragraphs: 0,
            };
        }

        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(Boolean).length;
        const paragraphs = text.split(/\n+/).filter(s => s.trim().length > 0).length;

        return { words, characters, sentences, paragraphs };
    }, [text]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Word and Character Counter</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Count words, characters, sentences, and paragraphs in your text.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="glass-input"
                        placeholder="Start typing or paste your text here..."
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            resize: 'vertical',
                            fontSize: '1.1rem'
                        }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <StatCard icon={<BookOpen />} label="Words" value={stats.words} />
                        <StatCard icon={<CaseSensitive />} label="Characters" value={stats.characters} />
                        <StatCard icon={<WrapText />} label="Sentences" value={stats.sentences} />
                        <StatCard icon={<Pilcrow />} label="Paragraphs" value={stats.paragraphs} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => {
    return (
        <div className="glass-panel" style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-md)'
        }}>
            <div style={{ color: 'var(--accent-primary)' }}>{icon}</div>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        </div>
    );
};

export default WordCounter;
