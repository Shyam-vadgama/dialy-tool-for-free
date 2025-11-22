import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Award, Clock, Type as TypeIcon } from 'lucide-react'; // Keep lucide icons for consistency in React project

/**
 * ------------------------------------------------------------------
 * WORD BANK & GENERATOR (Point 6 & 10)
 * ------------------------------------------------------------------
 */
const TEXTS = [ // More varied texts as requested for advanced
    "The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once.",
    "In the heart of the bustling city, a small, unassuming cafe offered a quiet refuge from the chaos, its aroma of freshly brewed coffee a comforting embrace.",
    "JavaScript's versatility allows it to power everything from interactive websites and mobile apps to complex server-side applications and even embedded systems.",
    "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
    "The sun dipped below the horizon, painting the sky in shades of orange, pink, and purple, a daily masterpiece of nature's artistry that soothes the soul.",
    "Debugging code is like being the detective in a crime movie where you are also the murderer.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving."
];

const WORD_LIST = ["ability", "able", "about", "above", "accept", "according", "account", "across", "act", "action", "activity", "actually", "add", "address", "administration", "admit", "adult", "affect", "after", "again", "against", "age", "agency", "agent", "ago", "agree", "agreement", "ahead", "air", "all", "allow", "almost", "alone", "along", "already", "also", "although", "always", "American", "among", "amount", "analysis", "and", "animal", "another", "answer", "any", "anyone", "anything", "appear", "apply", "approach", "area", "argue", "arm", "around", "arrive", "art", "article", "artist", "as", "ask", "assume", "at", "attack", "attention", "attorney", "audience", "author", "authority", "available", "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar", "base", "be", "beat", "beautiful", "because", "become", "bed", "before", "begin", "behavior", "behind", "believe", "belong", "best", "better", "between", "big", "bill", "billion", "bit", "black", "blood", "blue", "board", "boat", "body", "book", "born", "both", "box", "boy", "break", "bring", "brother", "budget", "build", "building", "business", "but", "buy", "by", "call", "camera", "campaign", "can", "cancer", "candidate", "capital", "car", "card", "care", "career", "carry", "case", "catch", "cause", "cell", "center", "central", "century", "certain", "certainly", "chair", "challenge", "chance", "change", "character", "charge", "check", "child", "choice", "choose", "church", "citizen", "city", "claim", "class", "clear", "clearly", "client", "climate", "close", "close", "coach", "collection", "college", "color", "come", "commercial", "common", "community", "company", "compare", "computer", "concern", "condition", "conference", "Congress", "consider", "consumer", "contain", "content", "control", "cost", "could", "country", "couple", "course", "court", "cover", "create", "crime", "cultural", "culture", "cup", "current", "customer", "cut", "dark", "data", "daughter", "day", "dead", "deal", "death", "debate", "decade", "decide", "decision", "deep", "defense", "defendant", "define", "definitely", "degree", "Democrat", "democratic", "describe", "design", "despite", "detail", "determine", "develop", "development", "die", "difference", "different", "difficult", "dinner", "direction", "directly", "director", "discover", "discuss", "discussion", "disease", "do", "doctor", "dog", "door", "down", "draw", "dream", "drive", "drop", "drug", "during", "each", "early", "east", "easy", "eat", "economic", "economy", "edge", "education", "effect", "effective", "effectively", "effort", "eight", "either", "election", "else", "employee", "end", "energy", "enjoy", "enough", "enter", "entire", "environment", "environmental", "especially", "establish", "even", "evening", "event", "ever", "every", "everyone", "everything", "evidence", "exact", "exactly", "example", "executive", "exist", "expect", "experience", "expert", "explain", "eye", "face", "fact", "factor", "fail", "fall", "family", "far", "fast", "father", "fear", "federal", "feel", "feeling", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finally", "financial", "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus", "follow", "food", "foot", "for", "force", "foreign", "forget", "form", "former", "forward", "four", "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "gas", "gate", "gather", "general", "generally", "generate", "get", "girl", "give", "glass", "go", "goal", "good", "government", "great", "green", "ground", "group", "grow", "growth", "guess", "gun", "guy", "hair", "half", "hand", "hang", "happen", "happy", "hard", "have", "he", "head", "health", "hear", "heart", "heat", "heavy", "help", "her", "here", "herself", "high", "him", "himself", "his", "history", "hit", "hold", "home", "hope", "hospital", "hot", "hotel", "hour", "house", "how", "however", "huge", "human", "hundred", "husband", "I", "idea", "identify", "if", "image", "imagine", "impact", "important", "improve", "in", "include", "including", "increase", "indeed", "indicate", "individual", "industry", "information", "inside", "instead", "institution", "interest", "international", "interview", "into", "introduce", "investment", "involve", "issue", "it", "item", "its", "itself", "job", "join", "just", "keep", "key", "kid", "kill", "kind", "kitchen", "know", "knowledge", "land", "language", "large", "last", "late", "later", "laugh", "law", "lawyer", "lay", "lead", "leader", "learn", "least", "leave", "left", "leg", "legal", "less", "let", "letter", "level", "lie", "life", "light", "like", "likely", "line", "list", "listen", "little", "live", "local", "long", "look", "lose", "loss", "lot", "love", "low", "machine", "magazine", "main", "maintain", "major", "majority", "make", "man", "manage", "management", "manager", "many", "market", "marriage", "material", "matter", "may", "maybe", "me", "mean", "meaning", "measure", "media", "medical", "meet", "meeting", "member", "memory", "mention", "message", "metal", "method", "middle", "might", "military", "million", "mind", "minute", "miss", "mission", "model", "modern", "moment", "money", "month", "more", "morning", "most", "mother", "mouth", "move", "movement", "movie", "Mr", "Mrs", "much", "music", "must", "my", "myself", "name", "nation", "national", "natural", "nature", "near", "nearly", "necessary", "need", "network", "never", "new", "news", "newspaper", "next", "nice", "night", "no", "nobody", "none", "nor", "north", "not", "note", "nothing", "notice", "now", "n't", "number", "occur", "of", "off", "offer", "office", "officer", "official", "often", "oh", "oil", "ok", "old", "on", "once", "one", "only", "onto", "open", "operation", "opportunity", "option", "or", "order", "organization", "other", "others", "our", "out", "outside", "over", "own", "owner", "page", "pain", "paint", "paper", "parent", "park", "part", "participant", "particular", "particularly", "partner", "party", "pass", "past", "patient", "pattern", "pay", "peace", "people", "per", "perform", "performance", "perhaps", "period", "person", "personal", "phone", "physical", "pick", "picture", "piece", "place", "plan", "plant", "play", "player", "point", "police", "policy", "political", "politics", "poll", "pollution", "pool", "poor", "popular", "population", "position", "positive", "possible", "post", "power", "practice", "prepare", "present", "president", "pressure", "pretty", "prevent", "price", "private", "probably", "problem", "process", "produce", "product", "production", "professional", "professor", "program", "project", "property", "protect", "prove", "provide", "public", "pull", "purpose", "push", "put", "quality", "question", "quickly", "quite", "race", "radio", "raise", "range", "rate", "rather", "reach", "read", "ready", "real", "reality", "realize", "really", "reason", "receive", "recent", "recently", "recognize", "record", "red", "reduce", "reflection", "region", "relate", "relationship", "religious", "remain", "remember", "remove", "report", "represent", "Republican", "require", "research", "resource", "respond", "response", "responsibility", "rest", "result", "return", "reveal", "rich", "right", "rise", "risk", "road", "rock", "role", "roll", "room", "rule", "run", "safe", "same", "save", "say", "scene", "school", "science", "scientist", "score", "sea", "season", "seat", "second", "section", "security", "see", "seek", "seem", "sell", "send", "senior", "sense", "series", "serious", "serve", "service", "set", "seven", "several", "sex", "sexual", "shake", "share", "she", "shoot", "short", "shot", "should", "shoulder", "show", "side", "sign", "significant", "similar", "simple", "simply", "since", "sing", "single", "sister", "sit", "site", "situation", "six", "size", "skill", "skin", "small", "smile", "so", "social", "society", "soldier", "some", "somebody", "someone", "something", "sometimes", "son", "song", "soon", "sort", "sound", "source", "south", "southern", "space", "speak", "special", "specific", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "standard", "star", "start", "state", "statement", "station", "stay", "step", "still", "stock", "stop", "store", "story", "strategy", "street", "strong", "structure", "student", "study", "stuff", "style", "subject", "success", "successful", "such", "suddenly", "suffer", "suggest", "summer", "support", "sure", "surface", "system", "table", "take", "talk", "task", "tax", "teach", "teacher", "team", "technology", "television", "tell", "ten", "tend", "term", "test", "than", "thank", "that", "the", "their", "them", "themselves", "then", "theory", "there", "therefore", "these", "they", "thing", "think", "third", "this", "those", "though", "thought", "thousand", "three", "through", "throughout", "throw", "thus", "time", "to", "today", "together", "tonight", "too", "top", "total", "tough", "toward", "town", "trade", "traditional", "train", "training", "travel", "treat", "treatment", "tree", "trial", "trip", "trouble", "true", "truth", "try", "turn", "TV", "two", "type", "under", "understand", "unit", "until", "up", "upon", "us", "use", "usually", "value", "various", "vary", "vast", "very", "victim", "view", "violate", "violence", "virtually", "visit", "voice", "vote", "wait", "walk", "wall", "want", "war", "watch", "water", "way", "we", "weapon", "wear", "weather", "wedding", "week", "weight", "welcome", "well", "west", "western", "what", "whatever", "when", "where", "whether", "which", "while", "white", "who", "whole", "whom", "whose", "why", "wide", "widely", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "word", "work", "worker", "world", "worry", "would", "write", "writer", "wrong", "yard", "yeah", "year", "yes", "yet", "you", "young", "your", "yourself", "zone"
];

// Helper to generate text (similar to the HTML file)
const generateText = (mode = 'normal', count = 30) => { // Reduced count for initial display
    let sourceWords = mode === 'code' ? HARD_WORDS : WORD_LIST;
    let text = [];
    for (let i = 0; i < count; i++) {
        text.push(sourceWords[Math.floor(Math.random() * sourceWords.length)]);
    }
    return text.join(' ');
};

/**
 * ------------------------------------------------------------------
 * ENGINE HOOK (Logic Core) - Reactified version of the HTML's script logic
 * ------------------------------------------------------------------
 */
const useTypingEngine = (timeLimitSeconds, initialMode) => {
    const [targetText, setTargetText] = useState('');
    const [typedInput, setTypedInput] = useState('');
    const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'RUNNING', 'FINISHED'
    const [wpm, setWpm] = useState(0);
    const [rawWpm, setRawWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [worstKeys, setWorstKeys] = useState({});
    const [currentTextMode, setCurrentTextMode] = useState(initialMode);
    
    const startTimeRef = useRef(null);
    const keystrokesRef = useRef([]); // Stores { char, expected, isCorrect, isBackspace, timestamp }
    const charIndexRef = useRef(0); // Current position in targetText
    const timerIntervalRef = useRef(null);

    const resetGame = useCallback((newTimeLimit, newMode) => {
        clearInterval(timerIntervalRef.current);
        const newText = generateText(newMode);
        setTargetText(newText);
        setTypedInput('');
        setGameState('IDLE');
        setWpm(0);
        setRawWpm(0);
        setAccuracy(100);
        setTimeLeft(newTimeLimit);
        setWorstKeys({});
        charIndexRef.current = 0;
        keystrokesRef.current = [];
        startTimeRef.current = null;
        setCurrentTextMode(newMode);
    }, []);

    // Effect to reset game when timeLimitSeconds or initialMode changes
    useEffect(() => {
        resetGame(timeLimitSeconds, initialMode);
    }, [timeLimitSeconds, initialMode, resetGame]);

    // Timer logic
    useEffect(() => {
        if (gameState === 'RUNNING') {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        setGameState('FINISHED');
                        clearInterval(timerIntervalRef.current);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (gameState === 'FINISHED' || gameState === 'IDLE') {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [gameState]);

    const calculateStats = useCallback(() => {
        if (!startTimeRef.current) return;
        const now = performance.now();
        const elapsedMin = (now - startTimeRef.current) / 1000 / 60;
        if (elapsedMin <= 0) return;

        const totalRecordedKeystrokes = keystrokesRef.current.filter(k => !k.isBackspace).length;
        const correctRecordedKeystrokes = keystrokesRef.current.filter(k => k.isCorrect && !k.isBackspace).length;

        const currentRawWpm = Math.round((totalRecordedKeystrokes / 5) / elapsedMin);
        const currentNetWpm = Math.round((correctRecordedKeystrokes / 5) / elapsedMin);
        const currentAccuracy = totalRecordedKeystrokes > 0 ? Math.round((correctRecordedKeystrokes / totalRecordedKeystrokes) * 100) : 100;

        setRawWpm(Math.max(0, currentRawWpm));
        setWpm(Math.max(0, currentNetWpm));
        setAccuracy(Math.max(0, currentAccuracy));

        // For tracking worst keys (post-game analysis)
        const errorMap = {};
        keystrokesRef.current.forEach(k => {
            if (!k.isCorrect && !k.isBackspace && k.expected) {
                errorMap[k.expected] = (errorMap[k.expected] || 0) + 1;
            }
        });
        const sorted = Object.entries(errorMap)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        setWorstKeys(Object.fromEntries(sorted));

    }, []);

    const handleKeyDown = useCallback((e) => {
        // Prevent default behavior for most keys to handle input manually
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
            e.preventDefault();
        }
        
        if (gameState === 'FINISHED') {
            if (e.key === 'Tab') { // Allow Tab to restart after test finished
                e.preventDefault();
                resetGame(timeLimitSeconds, currentTextMode);
            }
            return;
        }

        const { key } = e;
        const now = performance.now();

        if (gameState === 'IDLE') {
            setGameState('RUNNING');
            startTimeRef.current = now;
        }

        if (key === 'Backspace') {
            if (charIndexRef.current > 0) {
                keystrokesRef.current.push({ char: 'Backspace', timestamp: now, isCorrect: false, isBackspace: true });
                setTypedInput(prev => prev.slice(0, -1));
                charIndexRef.current--;
            }
            // Recalculate stats immediately after backspace
            calculateStats();
            return;
        }

        // Ignore modifier keys, etc.
        if (key.length > 1) {
            // Special handling for Tab to restart when game is not finished
            if (key === 'Tab') {
                e.preventDefault();
                resetGame(timeLimitSeconds, currentTextMode);
            }
            return;
        }

        // --- Core Typing Logic ---
        const expectedChar = targetText[charIndexRef.current];
        const isCorrect = key === expectedChar;

        keystrokesRef.current.push({ char: key, expected: expectedChar, timestamp: now, isCorrect, isBackspace: false });
        setTypedInput(prev => prev + key);
        charIndexRef.current++;

        // Update stats
        calculateStats();

        // Check for test completion
        if (charIndexRef.current >= targetText.length) {
            setGameState('FINISHED');
        }
    }, [gameState, targetText, calculateStats, resetGame, timeLimitSeconds, currentTextMode]);

    // Global keydown listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        targetText,
        typedInput,
        charIndex: charIndexRef.current,
        wpm,
        rawWpm,
        accuracy,
        timeLeft,
        gameState,
        worstKeys,
        resetGame,
        setCurrentTextMode,
    };
};

const TypingMaster = () => {
    // State for the main component to pass to the engine hook
    const [selectedTime, setSelectedTime] = useState(60);
    const [selectedMode, setSelectedMode] = useState('normal'); // 'normal' | 'code'

    const {
        targetText,
        typedInput,
        charIndex,
        wpm,
        rawWpm,
        accuracy,
        timeLeft,
        gameState,
        worstKeys,
        resetGame,
        setCurrentTextMode,
    } = useTypingEngine(selectedTime, selectedMode);

    const inputRef = useRef(null); // Ref for the hidden input field
    const cursorRef = useRef(null); // Ref for the cursor span
    const typingDisplayRef = useRef(null); // Ref for the typing display div

    // Focus the hidden input when the component mounts or game resets
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameState]); // Re-focus on game state changes, e.g., after reset

    // Update cursor position
    useEffect(() => {
        if (gameState === 'RUNNING' || gameState === 'IDLE') {
            const charElements = typingDisplayRef.current.querySelectorAll('.char');
            const currentCharElement = charElements[charIndex];

            if (currentCharElement && cursorRef.current) {
                const rect = currentCharElement.getBoundingClientRect();
                const parentRect = typingDisplayRef.current.getBoundingClientRect();
                cursorRef.current.style.left = `${rect.left - parentRect.left}px`;
                cursorRef.current.style.top = `${rect.top - parentRect.top}px`;
                // Add height for cursor to match line height
                cursorRef.current.style.height = `${rect.height}px`;

                // Scroll to current char if it's out of view
                currentCharElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else if (charIndex >= targetText.length && charElements.length > 0 && cursorRef.current) {
                // At the very end of the text
                const lastCharElement = charElements[charElements.length - 1];
                const rect = lastCharElement.getBoundingClientRect();
                const parentRect = typingDisplayRef.current.getBoundingClientRect();
                cursorRef.current.style.left = `${rect.right - parentRect.left}px`;
                cursorRef.current.style.top = `${rect.top - parentRect.top}px`;
                cursorRef.current.style.height = `${rect.height}px`;
                 lastCharElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [charIndex, gameState, targetText]);


    const handleRestart = useCallback(() => {
        resetGame(selectedTime, selectedMode);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [resetGame, selectedTime, selectedMode]);

    // Render logic
    return (
        <div className="container">
            <header className="header">
                <h1>Pro Typing Test</h1>
                <div className="stats">
                    <div className="stat-item">WPM: <span id="wpm-display">{wpm}</span></div>
                    <div className="stat-item">Raw: <span id="raw-wpm-display">{rawWpm}</span></div>
                    <div className="stat-item">Acc: <span id="accuracy-display">{accuracy}</span>%</div>
                </div>
            </header>

            <div className="modes">
                {/* Time Limit Buttons */}
                {[15, 30, 60, 120].map(time => (
                    <button
                        key={time}
                        onClick={() => {
                            setSelectedTime(time);
                            resetGame(time, selectedMode); // Reset game with new time
                        }}
                        className={selectedTime === time && gameState === 'IDLE' ? 'active' : ''}
                        disabled={gameState === 'RUNNING'}
                    >
                        {time}s
                    </button>
                ))}
                {/* Mode Buttons */}
                {['normal', 'code'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => {
                            setSelectedMode(mode);
                            resetGame(selectedTime, mode); // Reset game with new mode
                        }}
                        className={selectedMode === mode ? 'active' : ''}
                        disabled={gameState === 'RUNNING'}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
                <button onClick={handleRestart}>Restart</button>
            </div>

            <div className="typing-wrapper">
                <textarea
                    id="typing-input"
                    ref={inputRef}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    readOnly // Make it read-only as input is handled by global keydown listener
                ></textarea>
                <div id="typing-display" ref={typingDisplayRef}>
                    {targetText.split('').map((char, index) => {
                        let className = 'char';
                        if (index < typedInput.length) {
                            className += typedInput[index] === char ? ' correct' : ' incorrect';
                        }
                        if (index === charIndex && gameState !== 'FINISHED') {
                            // Highlighting current character position
                        }
                         // Highlight current word logic
                        const wordStart = targetText.lastIndexOf(' ', charIndex -1 ) + 1;
                        const wordEnd = targetText.indexOf(' ', charIndex);
                        const currentWordEnd = wordEnd === -1 ? targetText.length : wordEnd;

                        if (index >= wordStart && index < currentWordEnd && gameState !== 'FINISHED') {
                            className += ' current-word';
                        }

                        return <span key={index} data-index={index} className={className}>{char}</span>;
                    })}
                </div>
                <span id="cursor" ref={cursorRef} className={gameState === 'FINISHED' ? 'hidden' : ''}></span>
            </div>

            {gameState === 'FINISHED' && (
                <div id="results">
                    <h2>Test Complete</h2>
                    <div className="metric">Final Net WPM: <span id="final-wpm">{wpm}</span></div>
                    <div className="metric">Final Raw WPM: <span id="final-raw-wpm">{rawWpm}</span></div>
                    <div className="metric">Accuracy: <span id="final-accuracy">{accuracy}</span>%</div>
                    <div className="metric">Worst Keys (by error rate): <span id="worst-keys">
                        {Object.entries(worstKeys).map(([key, count]) => (
                           <span key={key} className="key error" style={{marginRight: '5px'}}>
                               {key === ' ' ? 'Space' : key} ({count})
                           </span>
                        ))}
                    </span></div>
                    {/* Heatmap can be added here */}
                </div>
            )}
        </div>
    );
};

export default TypingMaster;