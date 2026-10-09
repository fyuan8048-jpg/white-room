import React, { useState, useEffect } from 'react';
import { Users, X, Minimize2, Maximize2, Sparkles, BookOpen, Clock, Coffee, Shield } from 'lucide-react';

const BUDDIES = [
  {
    id: 'ayanokoji',
    name: 'Kiyotaka Ayanokoji',
    role: 'Demonic Curriculum Gen-4',
    status: 'Deep Strategic Calculation',
    quote: 'Quiet the mind. The equation solves itself in stillness.',
    accent: '#38bdf8',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80',
    baseMinutes: 48
  },
  {
    id: 'horikita',
    name: 'Suzune Horikita',
    role: 'Class 1-D Strategist',
    status: 'Curriculum Directives & Logic',
    quote: 'Compromise is the luxury of the unprepared.',
    accent: '#fbbf24',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    baseMinutes: 32
  },
  {
    id: 'hiyori',
    name: 'Hiyori Shiina',
    role: 'Quiet Bibliophile',
    status: 'Silent Reading in Midnight Library',
    quote: 'A good book makes the chaotic world disappear completely.',
    accent: '#a855f7',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    baseMinutes: 75
  },
  {
    id: 'silhouette',
    name: 'Silent Kyoto Scholar',
    role: 'Aesthetic Sanctuary Peer',
    status: 'Studying under Banker Lamp',
    quote: 'Focused work in quiet hours builds enduring mastery.',
    accent: '#34d399',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    baseMinutes: 19
  }
];

export default function StudyBuddiesOverlay({
  isOpen,
  onClose,
  currentSceneAccent = '#fbbf24'
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedOffset, setElapsedOffset] = useState(0);

  // Sync companion timers
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedOffset(prev => prev + 1);
    }, 60000); // add 1 minute every 60s
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed z-30 transition-all duration-300 select-none ${
      isMinimized 
        ? 'bottom-20 right-5' 
        : 'top-20 left-5 max-w-xs w-full'
    }`}>
      <div className="rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl p-4 shadow-2xl text-slate-100 space-y-3 animate-in fade-in slide-in-from-left-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-sans">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-cyan-400/20 text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                <span>Silent Study Room</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400">4 Scholars Studying Alongside You</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Close study room"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized view */}
        {isMinimized ? (
          <div className="flex items-center space-x-2 text-xs font-sans py-0.5">
            <div className="flex -space-x-2 overflow-hidden">
              {BUDDIES.slice(0, 3).map((b) => (
                <img
                  key={b.id}
                  src={b.avatar}
                  alt={b.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Silent Peers in Flow</span>
          </div>
        ) : (
          /* Expanded Companions List */
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 font-sans text-xs">
            {BUDDIES.map((buddy) => {
              const currentMins = buddy.baseMinutes + elapsedOffset;
              const hrs = Math.floor(currentMins / 60);
              const mins = currentMins % 60;
              const timeDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

              return (
                <div
                  key={buddy.id}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-start space-x-2.5 group"
                >
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
                    <img
                      src={buddy.avatar}
                      alt={buddy.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: buddy.accent }}
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-[11px] truncate">{buddy.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 flex items-center space-x-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{timeDisplay}</span>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{buddy.status}</div>

                    <p className="text-[9px] text-amber-200/80 italic mt-1 line-clamp-1 border-t border-white/5 pt-0.5">
                      "{buddy.quote}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
