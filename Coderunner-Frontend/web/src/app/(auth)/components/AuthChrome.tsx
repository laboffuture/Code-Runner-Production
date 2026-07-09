'use client';

/**
 * Shared chrome for the auth screens (/login, /register): the top status bar
 * (brand, rotating Python quote, clock, sound toggle) and the bottom news
 * ticker. Extracted from the login page so both pages render the identical
 * shell. Pages still own the backdrop, sidebar and form styles; `.font-header`
 * / `.font-tech` come from the page-level CSS.
 */

import { useState, useEffect } from 'react';

const PYTHON_QUOTES = [
  "The universe doesn't speak magic. It speaks Python.",
  "Every mission begins with Python.",
  "Stars are distant. Python brings them closer.",
  "Python turns curiosity into control.",
  "When systems fail, Python explains why.",
  "Python is not code. It's clarity.",
  "Each line of Python pushes you closer to orbit.",
  "Python rewards precision.",
  "In space, guesswork fails. Python succeeds.",
  "Python is how explorers think.",
  "Python errors are signals, not setbacks.",
  "Python doesn't break. It teaches.",
  "Fix the Python. Stabilize the mission.",
  "Mission complete. Python executed successfully.",
  "New clearance unlocked through Python.",
  "Python systems online.",
  "You didn't run Python. You mastered it.",
  "Exploration begins with Python.",
  "Python turned imagination into reality.",
  "Welcome to the Python frontier."
];

const NEWS_MESSAGES = [
  '<span class="text-cyan-400">PRIORITY TRANSMISSION:</span> SERVERS STABLE ACROSS ALL REGIONS',
  'DOUBLE XP WEEKEND ACTIVE',
  '<span class="text-red-500">WARNING:</span> HIGH LATENCY DETECTED ON NODE-09',
  'WELCOME TO PROJECT NOVA',
  '<span class="text-green-500">SUCCESS:</span> SECURITY PATCH 10.7.4 DEPLOYED',
  '<span class="text-cyan-400">ALERT:</span> MAINTENANCE SCHEDULED FOR 02:00 UTC',
  '<span class="text-yellow-500">BONUS:</span> WEEKLY CHALLENGES REFRESHED',
  'GLOBAL TOURNAMENT REGISTRATIONS NOW OPEN',
  '<span class="text-green-500">ONLINE:</span> 147,832 OPERATORS ACTIVE',
  '<span class="text-green-500">STABLE:</span> ALL GAME MODES OPERATIONAL',
  '<span class="text-cyan-400">AI NEWS:</span> NVIDIA RTX 5090 GPU ANNOUNCED WITH 24GB VRAM',
  '<span class="text-green-500">BREAKTHROUGH:</span> GPT-5 ACHIEVES 99% ACCURACY ON CODING TASKS',
  'OPENAI RELEASES NEW MULTIMODAL AI MODEL',
  '<span class="text-green-500">ONLINE:</span> GITHUB COPILOT NOW SUPPORTS 25 LANGUAGES',
];

export function AuthTopBar({ imagesLoaded }: { imagesLoaded: boolean }) {
  const [currentTime, setCurrentTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pythonQuote, setPythonQuote] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPythonQuote(PYTHON_QUOTES[Math.floor(Math.random() * PYTHON_QUOTES.length)]);
    const interval = setInterval(() => setPythonQuote(PYTHON_QUOTES[Math.floor(Math.random() * PYTHON_QUOTES.length)]), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-14 w-full flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 relative" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden', transition: 'opacity 0.15s ease, visibility 0.15s ease' }}>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-60" />
      <h1 className="font-header text-xl tracking-[0.2em] font-bold text-slate-800 uppercase">Project: <span className="text-blue-600">Nova</span></h1>
      <div className="hidden md:flex items-center justify-center flex-1 ml-8">
        <div className="learning-badge-container"><div className="learning-badge">
          <div className="learning-badge-corner top-left"></div><div className="learning-badge-corner top-right"></div>
          <div className="learning-badge-corner bottom-left"></div><div className="learning-badge-corner bottom-right"></div>
          <div className="learning-badge-content"><span className="font-header text-sm tracking-[0.15em] font-bold text-slate-700 uppercase leading-relaxed quote-text">{pythonQuote}</span></div>
        </div></div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] font-bold text-cyan-600">ENCRYPTION: ACTIVE</div>
          <div className="font-tech text-lg font-bold text-slate-700">{currentTime.split(':').map((p, i) => <span key={i}>{p}{i < 2 && <span className="animate-pulse">:</span>}</span>)}<span className="text-cyan-600 ml-1">ZULU</span></div>
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-cyan-50 transition-all sound-button">
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 sound-ring" />
          <div className="relative z-10">{soundEnabled ? <svg className="w-4 h-4 text-slate-700 group-hover:text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z"/><path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z"/></svg> : <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75z"/><path d="M12.22 5.22a.75.75 0 011.06 0l2 2 2-2a.75.75 0 111.06 1.06l-2 2 2 2a.75.75 0 11-1.06 1.06l-2-2-2 2a.75.75 0 01-1.06-1.06l2-2-2-2a.75.75 0 010-1.06z"/></svg>}</div>
        </button>
      </div>

      <style jsx global>{`
        .sound-button:hover { box-shadow: 0 0 20px rgba(59,130,246,0.4); }
        .sound-ring { animation: ring-shine 3s linear infinite; box-shadow: 0 0 10px rgba(59,130,246,0.5), inset 0 0 10px rgba(59,130,246,0.3); }
        @keyframes ring-shine { 0% { border-color: #3b82f6; } 50% { border-color: #60a5fa; box-shadow: 0 0 20px rgba(96,165,250,0.8), inset 0 0 15px rgba(96,165,250,0.5); } 100% { border-color: #3b82f6; } }
        .learning-badge-container { position: relative; padding: 2px; max-width: 600px; width: 100%; }
        .learning-badge { position: relative; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.05)); border: 1px solid rgba(59,130,246,0.3); padding: 6px 16px; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.1); animation: badge-glow 3s ease-in-out infinite; }
        .learning-badge-content { display: flex; align-items: center; justify-content: center; min-height: 20px; }
        .quote-text { animation: quote-fade 8s infinite; }
        @keyframes quote-fade { 0%,90% { opacity: 1; } 95%,100% { opacity: 0.3; } }
        .learning-badge-corner { position: absolute; width: 8px; height: 8px; border: 2px solid #3b82f6; }
        .learning-badge-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .learning-badge-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .learning-badge-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .learning-badge-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }
        @keyframes badge-glow { 0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.1); } 50% { box-shadow: 0 0 30px rgba(59,130,246,0.4), inset 0 0 30px rgba(59,130,246,0.2); } }
      `}</style>
    </div>
  );
}

export function AuthTicker({ imagesLoaded }: { imagesLoaded: boolean }) {
  const [newsFeed, setNewsFeed] = useState('');

  useEffect(() => {
    const shuffled = [...NEWS_MESSAGES].sort(() => Math.random() - 0.5).slice(0, 10);
    setNewsFeed(shuffled.map(msg => `// ${msg}`).join(' // '));
  }, []);

  return (
    <div className="h-12 w-full bg-slate-900 border-t border-slate-700 flex items-center z-50" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden', transform: imagesLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.2s ease', transitionDelay: '0.3s' }}>
      <div className="flex items-center gap-3 px-6 h-full border-r border-slate-700 bg-slate-800"><div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</div><div className="font-mono text-[10px] text-slate-400">NEWS FEED: ORBITAL_CHANNEL</div></div>
      <div className="flex-1 overflow-hidden relative flex items-center bg-slate-950"><div className="ticker font-mono text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: newsFeed }} /></div>
      <div className="px-6 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider"><span>MATCHMAKING: <span className="text-slate-300">IDLE</span></span><span>VOICE_COMMS: <span className="text-green-500">SECURE</span></span><span>ANTI-CHEAT: <span className="text-blue-500">ONLINE</span></span></div>

      <style jsx global>{`
        .ticker { white-space: nowrap; animation: marquee 25s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
}
