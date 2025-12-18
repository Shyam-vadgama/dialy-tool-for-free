import React, { useState, useEffect } from 'react';
import { Film, Gamepad2, AppWindow, GraduationCap, Search, Loader, ServerCrash, ExternalLink, Sparkles, Filter, Zap, X, ChevronRight } from 'lucide-react';

const CategoryIcon = ({ category, ...props }) => {
    switch (category) {
        case 'Movie': return <Film {...props} />;
        case 'Game': return <Gamepad2 {...props} />;
        case 'App': return <AppWindow {...props} />;
        case 'Course': return <GraduationCap {...props} />;
        default: return null;
    }
};

function AdvanceSearch() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Movie');
    const [mode, setMode] = useState('Official');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [focused, setFocused] = useState(false);

    const categories = ["Movie", "Game", "App", "Course"];
    
    // Load external CSS and JS
    useEffect(() => {
        // Load Tailwind CSS
        const tailwindLink = document.createElement('link');
        tailwindLink.rel = 'stylesheet';
        tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
        document.head.appendChild(tailwindLink);
        
        // Load Animate.css
        const animateLink = document.createElement('link');
        animateLink.rel = 'stylesheet';
        animateLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(animateLink);
        
        // Load AOS CSS
        const aosLink = document.createElement('link');
        aosLink.rel = 'stylesheet';
        aosLink.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
        document.head.appendChild(aosLink);
        
        // Load AOS JS
        const aosScript = document.createElement('script');
        aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        aosScript.async = true;
        aosScript.onload = () => {
            // Initialize AOS after the script loads
            window.AOS.init({
                duration: 800,
                once: true
            });
        };
        document.body.appendChild(aosScript);
        
        // Cleanup function
        return () => {
            document.head.removeChild(tailwindLink);
            document.head.removeChild(animateLink);
            document.head.removeChild(aosLink);
            document.body.removeChild(aosScript);
        };
    }, []);
    
    const handleSearch = async () => {
        if (!query.trim()) {
            setError("Please enter a search term.");
            return;
        }
        setLoading(true);
        setError(null);
        setResults([]);
        setStatus('');
        setSearched(true);

        const selectedMode = mode.includes("Official") ? "Official" : "Unofficial";

        try {
            const response = await fetch(`http://localhost:8000/advance-search?query=${encodeURIComponent(query)}&category=${category}&mode=${selectedMode}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResults(data.results);
            setStatus(data.status);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Skeleton loader for results
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded-lg mb-3 w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded-lg mb-2 w-full"></div>
                    <div className="h-4 bg-gray-700 rounded-lg mb-4 w-5/6"></div>
                    <div className="h-16 bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white font-sans relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 p-4 sm:p-6 md:p-8">
                <header className="mb-12 text-center animate__animated animate__fadeInDown">
                    <div className="flex justify-center items-center mb-6">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-4 shadow-lg shadow-purple-500/50 animate__animated animate__bounceIn">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate__animated animate__fadeIn">
                            Ultimate Content Finder
                        </h1>
                    </div>
                    <p className="text-gray-300 text-xl max-w-3xl mx-auto animate__animated animate__fadeIn animate__delay-1s">
                        Access <span className="text-green-400 font-bold bg-green-400/20 px-2 py-1 rounded-lg">Official Stores</span> or 
                        <span className="text-yellow-400 font-bold bg-yellow-400/20 px-2 py-1 rounded-lg ml-2">Unofficial Archives</span> instantly.
                    </p>
                </header>

                <div className="glass-panel p-8 rounded-3xl shadow-2xl mb-12 max-w-6xl mx-auto border border-gray-700 bg-gray-800/30 backdrop-blur-md animate__animated animate__fadeInUp">
                    <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
                        <div className={`relative flex-grow w-full transition-all duration-500 transform ${focused ? 'scale-105' : ''}`}>
                            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${focused ? 'text-purple-400 scale-110' : 'text-gray-400'}`} size={24} />
                            <input
                                type="text"
                                className="w-full p-5 pl-14 rounded-2xl bg-gray-800/80 border-2 border-gray-600 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 focus:bg-gray-900/90 outline-none text-lg"
                                placeholder="e.g. Cyberpunk 2077, Adobe Photoshop, Dune..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                            />
                            {query && (
                                <button 
                                    onClick={() => setQuery('')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 ease-in-out flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 disabled:opacity-70 disabled:transform-none text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={24} />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={24} />
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="mb-10" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center mb-6">
                            <Filter className="mr-3 text-purple-400" size={20} />
                            <h3 className="text-xl font-bold text-gray-200">Select Category</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-300 border-2 transform hover:-translate-y-2 ${category === cat ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500 shadow-xl shadow-purple-500/30' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700/70'}`}
                                    data-aos="zoom-in" data-aos-delay={categories.indexOf(cat) * 100}
                                >
                                    <CategoryIcon category={cat} size={32} className={`transition-all duration-300 ${category === cat ? 'text-purple-400 scale-110' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span className={`font-bold text-lg ${category === cat ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="200">
                        <div className="flex items-center mb-6">
                            <Filter className="mr-3 text-purple-400" size={20} />
                            <h3 className="text-xl font-bold text-gray-200">Search Mode</h3>
                        </div>
                        <div className="flex items-center justify-center rounded-2xl bg-gray-800/80 border-2 border-gray-700 p-1.5 w-full max-w-md mx-auto">
                            <button
                                onClick={() => setMode('Official')}
                                className={`w-1/2 py-4 rounded-xl text-center font-bold transition-all duration-300 ${mode === 'Official' ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span>Official</span>
                                    {mode === 'Official' && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>}
                                </div>
                            </button>
                            <button
                                onClick={() => setMode('Unofficial')}
                                className={`w-1/2 py-4 rounded-xl text-center font-bold transition-all duration-300 ${mode === 'Unofficial' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span>Unofficial</span>
                                    {mode === 'Unofficial' && <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse"></div>}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col justify-center items-center gap-6 text-xl text-purple-300 mt-16 animate__animated animate__fadeIn">
                        <div className="relative">
                            <Loader className="animate-spin" size={64} />
                            <div className="absolute inset-0 rounded-full border-4 border-purple-300/20"></div>
                        </div>
                        <p className="text-center text-2xl font-semibold">Contacting the digital librarians...</p>
                        <div className="w-80 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{width: '70%'}}></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-4 text-red-400 mt-16 bg-red-500/10 p-10 rounded-2xl border-2 border-red-400/30 max-w-lg mx-auto backdrop-blur-sm animate__animated animate__shakeX">
                        <ServerCrash size={56} />
                        <h3 className="text-2xl font-bold">An Error Occurred</h3>
                        <p className="text-center text-lg">{error}</p>
                        <button 
                            onClick={() => setError(null)}
                            className="mt-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {!loading && searched && results.length > 0 && (
                    <div className="mt-16 animate__animated animate__fadeIn">
                        <div className="text-center mb-10">
                            <p className="text-green-400 text-2xl font-bold mb-4 animate__animated animate__bounceIn">
                                Found {results.length} results!
                            </p>
                            <div className="inline-flex items-center px-6 py-3 bg-gray-800/80 rounded-full border-2 border-gray-700 animate__animated animate__fadeInUp">
                                <span className="text-gray-400 mr-3">Filter Quality:</span>
                                <span className="text-purple-400 font-bold text-lg">{status}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {results.map((item, index) => (
                                <div key={index} className="group bg-gray-800/60 p-6 rounded-2xl border-2 border-gray-700 hover:border-purple-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:bg-gray-800/80">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-purple-400 hover:text-purple-300 transition-colors group-hover:underline">
                                                {item.title}
                                            </a>
                                            <span className={`flex-shrink-0 ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${mode === 'Official' ? 'bg-green-600/80 text-white' : 'bg-yellow-500/90 text-black'}`}>
                                                {mode}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 break-all flex items-center">
                                            <ExternalLink size={16} className="mr-2" />
                                            {item.url}
                                        </p>
                                        <p className="text-gray-300 text-base leading-relaxed">{item.desc}</p>
                                    </div>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-6 block text-center w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                        <span>Visit</span>
                                        <ChevronRight size={18} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && searched && results.length === 0 && !error && (
                    <div className="text-center text-gray-500 mt-20 animate__animated animate__fadeIn">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-8 animate__animated animate__pulse animate__infinite">
                            <Search size={48} />
                        </div>
                        <h3 className="text-4xl font-bold mb-4">No Results Found</h3>
                        <p className="max-w-md mx-auto text-lg mb-8">The digital archives are silent. Try a different query or category.</p>
                        <button 
                            onClick={() => setSearched(false)}
                            className="px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
                        >
                            Start New Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdvanceSearch;