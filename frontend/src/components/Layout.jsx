import React from 'react';
import Sidebar from './Sidebar';
import { Sun, Moon, Search } from 'lucide-react';

const Layout = ({ children }) => {
    const [isDark, setIsDark] = React.useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: 'var(--spacing-xl)',
                maxWidth: 'calc(100vw - 260px)'
            }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    <div className="search-bar glass-input" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-full)',
                        width: '400px',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="glass-button"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                <div className="content-area fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
