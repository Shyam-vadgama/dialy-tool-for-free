import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileCode, Eye } from 'lucide-react';

const MarkdownPreview = () => {
    const [markdown, setMarkdown] = useState('# Hello World\n\nStart typing markdown here...\n\n- Item 1\n- Item 2\n\n```javascript\nconsole.log("Code block");\n```');

    return (
        <div className="container" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>Markdown Preview</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time markdown editor and previewer.</p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flex: 1, minHeight: 0 }}>

                {/* Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        padding: 'var(--spacing-sm)',
                        background: 'rgba(0,0,0,0.2)',
                        borderTopLeftRadius: 'var(--radius-lg)',
                        borderTopRightRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        border: '1px solid var(--border-color)',
                        borderBottom: 'none'
                    }}>
                        <FileCode size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Editor</span>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="glass-input"
                        style={{
                            flex: 1,
                            resize: 'none',
                            padding: 'var(--spacing-lg)',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderBottomLeftRadius: 'var(--radius-lg)',
                            borderBottomRightRadius: 'var(--radius-lg)',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}
                    />
                </div>

                {/* Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        padding: 'var(--spacing-sm)',
                        background: 'rgba(0,0,0,0.2)',
                        borderTopLeftRadius: 'var(--radius-lg)',
                        borderTopRightRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        border: '1px solid var(--border-color)',
                        borderBottom: 'none'
                    }}>
                        <Eye size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Preview</span>
                    </div>
                    <div
                        className="glass-panel"
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-xl)',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderBottomLeftRadius: 'var(--radius-lg)',
                            borderBottomRightRadius: 'var(--radius-lg)',
                            overflowY: 'auto',
                            background: 'rgba(255,255,255,0.02)'
                        }}
                    >
                        <div className="markdown-body">
                            <ReactMarkdown>{markdown}</ReactMarkdown>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Add basic markdown styles
const style = document.createElement('style');
style.textContent = `
  .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-bottom: 1rem; margin-top: 1.5rem; }
  .markdown-body p { margin-bottom: 1rem; line-height: 1.6; }
  .markdown-body ul, .markdown-body ol { margin-bottom: 1rem; padding-left: 2rem; }
  .markdown-body code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.4rem; borderRadius: 4px; font-family: monospace; }
  .markdown-body pre { background: rgba(0,0,0,0.3); padding: 1rem; borderRadius: 8px; overflow-x: auto; margin-bottom: 1rem; }
  .markdown-body pre code { background: transparent; padding: 0; }
  .markdown-body blockquote { border-left: 4px solid var(--accent-primary); padding-left: 1rem; color: var(--text-secondary); margin-bottom: 1rem; }
`;
document.head.appendChild(style);

export default MarkdownPreview;
