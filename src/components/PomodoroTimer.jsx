import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings, 
  Target, 
  CheckCircle2, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { focusAudioSuite } from '../utils/audioSynthesizer';

export default function PomodoroTimer({
  timerConfig,
  onUpdateTimerConfig,
  activeTask,
  onTaskPomodoroIncrement,
  onSessionComplete,
  scene,
  onToggleZenMode
}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak' | 'stopwatch'
  const [timeLeft, setTimeLeft] = useState(timerConfig.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings draft
  const [customFocus, setCustomFocus] = useState(timerConfig.focusTime);
  const [customShort, setCustomShort] = useState(timerConfig.shortBreakTime);
  const [customLong, setCustomLong] = useState(timerConfig.longBreakTime);
  const [customInterval, setCustomInterval] = useState(timerConfig.longBreakInterval || 4);

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
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleCompleted();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, sessionCount, timerConfig]);

  const handleCompleted = () => {
    setIsRunning(false);

    // Play warm singing bowl / temple chime (NO harsh beep)
    focusAudioSuite.playSessionChime();

    if (mode === 'focus') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: [scene.accentColor || '#38bdf8', '#fbbf24', '#ffffff', '#e2e8f0']
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

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else if (mode === 'focus') {
      setTimeLeft(timerConfig.focusTime * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(timerConfig.shortBreakTime * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(timerConfig.longBreakTime * 60);
    }
  };

  const skipPhase = () => {
    setIsRunning(false);
    setMode(mode === 'focus' ? 'shortBreak' : 'focus');
  };

  const selectPreset = (mins) => {
    setMode('focus');
    setIsRunning(false);
    onUpdateTimerConfig({ ...timerConfig, focusTime: mins });
    setTimeLeft(mins * 60);
  };

  const formatMinutes = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatStopwatch = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalModeSecs = () => {
    if (mode === 'focus') return timerConfig.focusTime * 60;
    if (mode === 'shortBreak') return timerConfig.shortBreakTime * 60;
    if (mode === 'longBreak') return timerConfig.longBreakTime * 60;
    return 1;
  };

  const progress = mode === 'stopwatch' 
    ? (stopwatchSeconds % 3600) / 3600 
    : 1 - timeLeft / totalModeSecs();

  // Circular calculations
  const size = 300;
  const stroke = 6;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`relative max-w-xl mx-auto rounded-3xl p-6 sm:p-8 transition-all duration-500 ${scene.cardBg} border border-white/10 shadow-2xl`}>
      
      {/* Top Header Mode Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span 
            className="w-2.5 h-2.5 rounded-full animate-pulse" 
            style={{ backgroundColor: scene.accentColor }} 
          />
          <span className="font-serif text-xs tracking-widest uppercase text-slate-300">
            {mode === 'focus' ? 'Focus Protocol' : mode === 'stopwatch' ? 'Endless Stopwatch' : 'Rest Phase'}
          </span>
          <span className="text-xs text-slate-500 font-serif">·</span>
          <span className="text-xs font-serif text-slate-400">
            Session {sessionCount + 1}
          </span>
        </div>

        {/* Mode switcher pills */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-serif">
          <button
            onClick={() => setMode('focus')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Rest
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Rest
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'stopwatch'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Circular Progress & Clock Face */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-white/10"
              fill="transparent"
            />
            {/* Active progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={scene.accentColor || '#38bdf8'}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: isRunning ? `drop-shadow(0 0 12px ${scene.accentColor}90)` : 'none'
              }}
            />
          </svg>

          {/* Central Typography Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            
            <span className="text-[11px] font-serif tracking-widest uppercase text-slate-400 mb-1">
              {mode === 'stopwatch' ? 'Elapsed Time' : isRunning ? 'In Deep Flow' : 'Ready'}
            </span>

            {/* Time numbers */}
            <div className="font-serif font-bold text-6xl sm:text-7xl tracking-tight text-white select-none drop-shadow-md">
              {mode === 'stopwatch' ? formatStopwatch(stopwatchSeconds) : formatMinutes(timeLeft)}
            </div>

            {/* Session dots indicator */}
            {mode !== 'stopwatch' && (
              <div className="flex items-center space-x-1.5 mt-2">
                {[...Array(timerConfig.longBreakInterval || 4)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < (sessionCount % (timerConfig.longBreakInterval || 4))
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick presets (25m, 45m, 60m, 90m) */}
        {mode === 'focus' && (
          <div className="flex items-center space-x-2 mt-2 text-xs font-serif">
            <span className="text-slate-400 text-[11px]">INTERVALS:</span>
            {[15, 25, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => selectPreset(mins)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  timerConfig.focusTime === mins
                    ? 'bg-white/20 text-white font-semibold border border-white/20'
                    : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRunning}
            className="flex items-center space-x-2.5 px-8 py-4 rounded-2xl font-serif font-bold text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 bg-white text-neutral-950 hover:bg-neutral-100 shadow-white/10"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Begin</span>
              </>
            )}
          </button>

          {mode !== 'stopwatch' && (
            <button
              onClick={skipPhase}
              className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
              title="Next Interval"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pinned Active Focus Target */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-serif uppercase tracking-wider text-slate-400">
              Active Focus Target
            </div>
            <div className="font-serif font-semibold text-xs sm:text-sm text-white truncate flex items-center space-x-2">
              <span>{activeTask ? activeTask.title : 'General Deep Study & Focus'}</span>
              {activeTask && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  RANK {activeTask.rank}
                </span>
              )}
            </div>
          </div>
        </div>

        {activeTask && (
          <button
            onClick={() => onTaskPomodoroIncrement && onTaskPomodoroIncrement(activeTask.id)}
            className="px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white font-serif text-xs flex items-center space-x-1 flex-shrink-0"
            title="Log completed pomodoro"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
            <span>+1 Done ({activeTask.completedSessions}/{activeTask.targetSessions})</span>
          </button>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-serif">
              <h3 className="font-bold text-lg">Timer Intervals</h3>
              <span className="text-xs text-slate-400">Customize Focus & Breaks</span>
            </div>

            <div className="space-y-4 font-serif text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Focus Interval:</span>
                  <span className="text-amber-300 font-bold">{customFocus} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Short Rest Interval:</span>
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
                  <span>Long Rest Interval:</span>
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

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10 text-xs font-serif">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateTimerConfig({
                    ...timerConfig,
                    focusTime: customFocus,
                    shortBreakTime: customShort,
                    longBreakTime: customLong,
                    longBreakInterval: customInterval
                  });
                  setIsSettingsOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
