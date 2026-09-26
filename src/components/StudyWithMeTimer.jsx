import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings, 
  Check, 
  Target, 
  Sparkles,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { focusAudioSuite } from '../utils/audioSynthesizer';

export default function StudyWithMeTimer({
  timerConfig,
  onUpdateTimerConfig,
  activeTask,
  onSetActiveTaskTitle,
  onTaskPomodoroIncrement,
  onSessionComplete,
  scene
}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(timerConfig.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Card appearance mode: 'glass' (default) | 'transparent' | 'solid'
  const [cardStyle, setCardStyle] = useState(() => {
    return localStorage.getItem('whiteroom_card_style') || 'glass';
  });

  // Quick task input under timer
  const [taskInput, setTaskInput] = useState(activeTask ? activeTask.title : '');

  // Custom times draft
  const [customFocus, setCustomFocus] = useState(timerConfig.focusTime);
  const [customShort, setCustomShort] = useState(timerConfig.shortBreakTime);
  const [customLong, setCustomLong] = useState(timerConfig.longBreakTime);

  useEffect(() => {
    localStorage.setItem('whiteroom_card_style', cardStyle);
  }, [cardStyle]);

  useEffect(() => {
    if (activeTask) {
      setTaskInput(activeTask.title);
    }
  }, [activeTask]);

  useEffect(() => {
    if (mode === 'focus') {
      setTimeLeft(timerConfig.focusTime * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(timerConfig.shortBreakTime * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(timerConfig.longBreakTime * 60);
    }
    setIsRunning(false);
  }, [mode, timerConfig.focusTime, timerConfig.shortBreakTime, timerConfig.longBreakTime]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, sessionCount, timerConfig]);

  const handleComplete = () => {
    setIsRunning(false);
    focusAudioSuite.playSessionChime();

    if (mode === 'focus') {
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 },
          colors: [scene.accentColor || '#fbbf24', '#ffffff', '#38bdf8']
        });
      } catch (e) {}

      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);

      if (onSessionComplete) onSessionComplete(timerConfig.focusTime);
      if (activeTask && onTaskPomodoroIncrement) onTaskPomodoroIncrement(activeTask.id);

      if (nextCount % (timerConfig.longBreakInterval || 4) === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(timerConfig.focusTime * 60);
    else if (mode === 'shortBreak') setTimeLeft(timerConfig.shortBreakTime * 60);
    else if (mode === 'longBreak') setTimeLeft(timerConfig.longBreakTime * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    setMode(mode === 'focus' ? 'shortBreak' : 'focus');
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (onSetActiveTaskTitle && taskInput.trim()) {
      onSetActiveTaskTitle(taskInput.trim());
    }
  };

  const cycleCardStyle = () => {
    if (cardStyle === 'glass') setCardStyle('transparent');
    else if (cardStyle === 'transparent') setCardStyle('solid');
    else setCardStyle('glass');
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Card background styling based on user preference
  const cardClasses = {
    glass: 'bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl',
    transparent: 'bg-transparent border-transparent shadow-none',
    solid: 'bg-neutral-950/90 border border-white/20 shadow-2xl backdrop-blur-md'
  }[cardStyle];

  return (
    <div className="relative max-w-lg w-full mx-auto select-none">
      
      {/* Timer Container with Customizable Transparency */}
      <div className={`rounded-3xl p-6 sm:p-8 text-center text-slate-100 transition-all duration-300 space-y-6 ${cardClasses}`}>
        
        {/* Mode Selector Capsule + Transparency Switcher */}
        <div className="flex items-center justify-center space-x-2">
          <div className="inline-flex items-center p-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 font-sans text-xs sm:text-sm">
            <button
              onClick={() => setMode('focus')}
              className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-200 ${
                mode === 'focus'
                  ? 'bg-white/25 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => setMode('shortBreak')}
              className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-200 ${
                mode === 'shortBreak'
                  ? 'bg-white/25 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => setMode('longBreak')}
              className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-200 ${
                mode === 'longBreak'
                  ? 'bg-white/25 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Quick Transparency Switcher Toggle */}
          <button
            onClick={cycleCardStyle}
            className="p-2 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all text-xs"
            title={`Card style: ${cardStyle.toUpperCase()} (Click to toggle Transparent / Glass / Solid)`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Digits Display (enhanced with deep text drop-shadow for transparent mode readability) */}
        <div className="py-2">
          <div className="font-mono font-bold text-7xl sm:text-8xl md:text-9xl tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            {formattedTime}
          </div>
          
          <div className="flex items-center justify-center space-x-2 mt-2 text-xs font-sans text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span 
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: scene.accentColor || '#fbbf24' }} 
            />
            <span className="uppercase tracking-widest text-[11px] font-medium">
              {isRunning ? 'Flow State Active' : 'Ready'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">Round #{sessionCount + 1}</span>
          </div>
        </div>

        {/* Start / Pause & Quick Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/15 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 backdrop-blur-md"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="px-10 sm:px-12 py-3.5 sm:py-4 rounded-full font-sans font-bold text-base sm:text-lg tracking-wider uppercase transition-all shadow-xl active:scale-95 bg-white text-black hover:bg-neutral-100 shadow-white/20"
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>

          <button
            onClick={skipTimer}
            className="p-3.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/15 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 backdrop-blur-md"
            title="Skip to next interval"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/15 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 backdrop-blur-md"
            title="Timer Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* StudyWithMe "I am working on..." Task Input Field */}
        <div className="pt-2">
          <form onSubmit={handleTaskSubmit} className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="What are you working on today?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm font-sans focus:outline-none focus:border-white/50 text-center pr-12 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
              title="Set active focus directive"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>

          {activeTask && (
            <div className="mt-2.5 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs text-amber-200">
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Rank {activeTask.rank}: {activeTask.title}</span>
              <span className="text-slate-400 font-mono">({activeTask.completedSessions}/{activeTask.targetSessions})</span>
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-neutral-950 p-6 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
              <h3 className="font-bold text-base text-white">Timer & Appearance</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Card Appearance Switcher */}
            <div className="space-y-1.5 font-sans text-xs">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Timer Card Style</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCardStyle('transparent')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    cardStyle === 'transparent' ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold' : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => setCardStyle('glass')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    cardStyle === 'glass' ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold' : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  Glass (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setCardStyle('solid')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    cardStyle === 'solid' ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold' : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  Solid Dark
                </button>
              </div>
            </div>

            {/* Intervals */}
            <div className="space-y-4 font-sans text-xs pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Pomodoro:</span>
                  <span className="text-amber-300 font-bold">{customFocus} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Short Break:</span>
                  <span className="text-amber-300 font-bold">{customShort} mins</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={customShort}
                  onChange={(e) => setCustomShort(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Long Break:</span>
                  <span className="text-amber-300 font-bold">{customLong} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={customLong}
                  onChange={(e) => setCustomLong(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateTimerConfig({
                    ...timerConfig,
                    focusTime: customFocus,
                    shortBreakTime: customShort,
                    longBreakTime: customLong
                  });
                  setIsSettingsOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
