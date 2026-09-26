import React, { useEffect, useState } from 'react';
import { 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Target,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';
import { QUOTES } from '../utils/quotes';

export default function ZenMode({
  isOpen,
  onClose,
  timerConfig,
  activeTask,
  isMuted,
  onToggleMute,
  themeObj
}) {
  const [timeLeft, setTimeLeft] = useState(timerConfig.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let interval = null;
    if (isOpen && isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            soundEngine.playChime('focusComplete');
            setIsRunning(false);
            return timerConfig.focusTime * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isRunning, timerConfig]);

  if (!isOpen) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const currentQuote = QUOTES[quoteIndex % QUOTES.length];

  return (
    <div className="fixed inset-0 z-50 bg-[#05070c] text-slate-100 flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* Background aesthetic grid & radial glow */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 0%, transparent 60%), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase font-semibold">
            THE WHITE ROOM // VOID PROTOCOL
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted 
                ? 'border-rose-500/40 text-rose-400 bg-rose-500/10' 
                : 'border-slate-800 text-slate-300 hover:text-cyan-300 bg-slate-900/60'
            }`}
            title="Toggle Ambient Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-lg"
          >
            <Minimize2 className="w-4 h-4 text-cyan-400" />
            <span>Exit Void (Esc)</span>
          </button>
        </div>
      </div>

      {/* Center Focus Sanctum */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
        
        {/* Active Target Banner */}
        {activeTask && (
          <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-xs tracking-wider uppercase backdrop-blur-md">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Target: {activeTask.title} [Rank {activeTask.rank}]</span>
          </div>
        )}

        {/* Huge Digital Clock */}
        <div className="relative">
          <div className="font-mono font-bold text-8xl sm:text-9xl md:text-[12rem] tracking-tighter text-white drop-shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            {formatted}
          </div>
          <div className="text-center font-mono text-xs text-cyan-400/80 tracking-widest uppercase mt-2">
            {isRunning ? 'HYPER-FOCUS ENGAGED' : 'PAUSED // BREATHE DEEPLY'}
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center space-x-6 mt-10">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsRunning(false);
              setTimeLeft(timerConfig.focusTime * 60);
            }}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-md active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsRunning(!isRunning);
            }}
            className="px-10 py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-base tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 flex items-center space-x-3"
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Engage</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setTimeLeft(timerConfig.focusTime * 60);
              setQuoteIndex((prev) => prev + 1);
            }}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-md active:scale-95"
            title="Next Aphorism"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>

      </div>

      {/* Bottom Quote Monologue */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="font-serif italic text-sm sm:text-base text-slate-300">
          "{currentQuote.quote}"
        </p>
        <p className="font-mono text-xs text-cyan-400/80 mt-1">
          — {currentQuote.speaker}, <span className="text-slate-500">{currentQuote.source}</span>
        </p>
      </div>

    </div>
  );
}
