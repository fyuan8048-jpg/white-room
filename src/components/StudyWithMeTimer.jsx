import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings, 
  Check, 
  Target, 
  Sparkles,
  Layers,
  Plus,
  Minus,
  X,
  Edit2,
  Bell,
  BellOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { focusAudioSuite } from '../utils/audioSynthesizer';

// Inline Web Worker ticker to bypass browser background tab throttling
const createTimerWorker = () => {
  const code = `
    let timerId = null;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
          self.postMessage('tick');
        }, 250);
      } else if (e.data === 'stop') {
        if (timerId) clearInterval(timerId);
        timerId = null;
      }
    };
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export default function StudyWithMeTimer({
  timerConfig,
  onUpdateTimerConfig,
  activeTask,
  onSetActiveTaskTitle,
  onClearActiveTask,
  onUpdateActiveTask,
  onTaskPomodoroIncrement,
  onTaskPomodoroDecrement,
  onSessionComplete,
  scene
}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(timerConfig.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Card appearance mode: 'glass' (default) | 'transparent' | 'solid'
  const [cardStyle, setCardStyle] = useState(() => {
    return localStorage.getItem('whiteroom_card_style') || 'glass';
  });

  // Task creation options
  const [taskInput, setTaskInput] = useState('');
  const [taskRank, setTaskRank] = useState('A');
  const [taskTargetSessions, setTaskTargetSessions] = useState(''); // empty = no target restriction

  // Editing state for active task
  const [editTitle, setEditTitle] = useState('');
  const [editRank, setEditRank] = useState('A');
  const [editTarget, setEditTarget] = useState('');

  // Custom times draft
  const [customFocus, setCustomFocus] = useState(timerConfig.focusTime);
  const [customShort, setCustomShort] = useState(timerConfig.shortBreakTime);
  const [customLong, setCustomLong] = useState(timerConfig.longBreakTime);
  const [customLongInterval, setCustomLongInterval] = useState(timerConfig.longBreakInterval || 4);

  // References for robust background delta-timing
  const workerRef = useRef(null);
  const endTimeRef = useRef(null);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Persist card style
  useEffect(() => {
    localStorage.setItem('whiteroom_card_style', cardStyle);
  }, [cardStyle]);

  // Keep task input in sync if activeTask exists
  useEffect(() => {
    if (activeTask) {
      setTaskInput(activeTask.title);
      setEditTitle(activeTask.title);
      setEditRank(activeTask.rank || 'A');
      setEditTarget(activeTask.targetSessions ? String(activeTask.targetSessions) : '');
    } else {
      setTaskInput('');
    }
  }, [activeTask]);

  // Reset time left when mode or duration config changes while NOT running
  useEffect(() => {
    if (!isRunning) {
      let duration = timerConfig.focusTime * 60;
      if (mode === 'shortBreak') duration = timerConfig.shortBreakTime * 60;
      else if (mode === 'longBreak') duration = timerConfig.longBreakTime * 60;
      setTimeLeft(duration);
      timeLeftRef.current = duration;
    }
  }, [mode, timerConfig.focusTime, timerConfig.shortBreakTime, timerConfig.longBreakTime]);

  // Initialize Web Worker ticker once
  useEffect(() => {
    let worker = null;
    try {
      worker = createTimerWorker();
      workerRef.current = worker;
      worker.onmessage = (e) => {
        if (e.data === 'tick' && endTimeRef.current) {
          syncTimer();
        }
      };
    } catch (err) {
      console.warn('Web Worker initialization error:', err);
    }

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, []);

  // Main-thread fallback interval (in case worker is not available)
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        syncTimer();
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // High-accuracy timestamp sync function
  const syncTimer = () => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const diff = endTimeRef.current - now;
    const remaining = Math.max(0, Math.ceil(diff / 1000));

    if (remaining <= 0) {
      endTimeRef.current = null;
      setTimeLeft(0);
      timeLeftRef.current = 0;
      if (workerRef.current) workerRef.current.postMessage('stop');
      handleComplete();
    } else {
      setTimeLeft(remaining);
      timeLeftRef.current = remaining;
    }
  };

  // Immediate resync upon returning to tab or window focus (instant zero-lag recovery)
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (isRunning && endTimeRef.current) {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
    };
  }, [isRunning]);

  // Dynamic Browser Tab Title Countdown
  useEffect(() => {
    if (isRunning) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const modeLabel = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Long Break';
      document.title = `(${formatted}) ${modeLabel} · The White Room`;
    } else {
      document.title = 'The White Room | High-Aesthetic Anime Focus Sanctuary';
    }

    return () => {
      document.title = 'The White Room | High-Aesthetic Anime Focus Sanctuary';
    };
  }, [timeLeft, isRunning, mode]);

  // Session completion trigger
  const handleComplete = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (workerRef.current) workerRef.current.postMessage('stop');

    focusAudioSuite.playSessionChime();

    // Desktop Notification if permitted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(mode === 'focus' ? 'Focus Session Complete!' : 'Break Finished!', {
          body: mode === 'focus' ? 'Masterpiece focus logged. Time for a well-deserved break.' : 'Break is over. Ready to begin your next focus round?',
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }

    if (mode === 'focus') {
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: [scene?.accentColor || '#fbbf24', '#ffffff', '#38bdf8']
        });
      } catch (e) {}

      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);

      if (onSessionComplete) onSessionComplete({
        id: `sess-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMinutes: timerConfig.focusTime,
        taskName: activeTask ? activeTask.title : 'White Room Focus',
        category: activeTask ? activeTask.category : 'Curriculum',
        mood: 'calm',
        userComment: ''
      });

      if (activeTask && onTaskPomodoroIncrement) {
        onTaskPomodoroIncrement(activeTask.id);
      }

      if (nextCount % (timerConfig.longBreakInterval || 4) === 0) {
        setMode('longBreak');
        const nextDuration = timerConfig.longBreakTime * 60;
        setTimeLeft(nextDuration);
        timeLeftRef.current = nextDuration;
      } else {
        setMode('shortBreak');
        const nextDuration = timerConfig.shortBreakTime * 60;
        setTimeLeft(nextDuration);
        timeLeftRef.current = nextDuration;
      }
    } else {
      setMode('focus');
      const nextDuration = timerConfig.focusTime * 60;
      setTimeLeft(nextDuration);
      timeLeftRef.current = nextDuration;
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      endTimeRef.current = null;
      if (workerRef.current) workerRef.current.postMessage('stop');
    } else {
      // Start
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
      setIsRunning(true);
      if (workerRef.current) workerRef.current.postMessage('start');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (workerRef.current) workerRef.current.postMessage('stop');

    let initial = timerConfig.focusTime * 60;
    if (mode === 'shortBreak') initial = timerConfig.shortBreakTime * 60;
    else if (mode === 'longBreak') initial = timerConfig.longBreakTime * 60;

    setTimeLeft(initial);
    timeLeftRef.current = initial;
  };

  const skipTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (workerRef.current) workerRef.current.postMessage('stop');

    if (mode === 'focus') {
      setMode('shortBreak');
      const nextTime = timerConfig.shortBreakTime * 60;
      setTimeLeft(nextTime);
      timeLeftRef.current = nextTime;
    } else {
      setMode('focus');
      const nextTime = timerConfig.focusTime * 60;
      setTimeLeft(nextTime);
      timeLeftRef.current = nextTime;
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const parsedTarget = taskTargetSessions.trim() ? Number(taskTargetSessions) : null;
    if (onSetActiveTaskTitle) {
      onSetActiveTaskTitle(taskInput.trim(), parsedTarget, taskRank);
    }
  };

  const handleSaveActiveTaskEdit = (e) => {
    e.preventDefault();
    if (!activeTask || !onUpdateActiveTask) return;

    const parsedTarget = editTarget.trim() ? Number(editTarget) : null;
    onUpdateActiveTask({
      title: editTitle.trim() || activeTask.title,
      rank: editRank,
      targetSessions: parsedTarget
    });
    setIsEditingTask(false);
  };

  const cycleCardStyle = () => {
    if (cardStyle === 'glass') setCardStyle('transparent');
    else if (cardStyle === 'transparent') setCardStyle('solid');
    else setCardStyle('glass');
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const cardClasses = {
    glass: 'bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl',
    transparent: 'bg-transparent border-transparent shadow-none',
    solid: 'bg-neutral-950/90 border border-white/20 shadow-2xl backdrop-blur-md'
  }[cardStyle];

  const rankBadgeColors = {
    'S': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'A': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'B': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'C': 'bg-slate-700/30 text-slate-300 border-slate-600/40'
  };

  return (
    <div className="relative max-w-lg w-full mx-auto select-none">
      
      {/* Timer Container with Customizable Transparency */}
      <div className={`rounded-3xl p-6 sm:p-8 text-center text-slate-100 transition-all duration-300 space-y-6 ${cardClasses}`}>
        
        {/* Mode Selector Capsule + Transparency Switcher */}
        <div className="flex items-center justify-center space-x-2">
          <div className="inline-flex items-center p-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 font-sans text-xs sm:text-sm">
            <button
              onClick={() => {
                if (mode !== 'focus') {
                  setMode('focus');
                  setIsRunning(false);
                  endTimeRef.current = null;
                  if (workerRef.current) workerRef.current.postMessage('stop');
                  setTimeLeft(timerConfig.focusTime * 60);
                  timeLeftRef.current = timerConfig.focusTime * 60;
                }
              }}
              className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-200 ${
                mode === 'focus'
                  ? 'bg-white/25 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => {
                if (mode !== 'shortBreak') {
                  setMode('shortBreak');
                  setIsRunning(false);
                  endTimeRef.current = null;
                  if (workerRef.current) workerRef.current.postMessage('stop');
                  setTimeLeft(timerConfig.shortBreakTime * 60);
                  timeLeftRef.current = timerConfig.shortBreakTime * 60;
                }
              }}
              className={`px-4 sm:px-5 py-1.5 rounded-full transition-all duration-200 ${
                mode === 'shortBreak'
                  ? 'bg-white/25 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => {
                if (mode !== 'longBreak') {
                  setMode('longBreak');
                  setIsRunning(false);
                  endTimeRef.current = null;
                  if (workerRef.current) workerRef.current.postMessage('stop');
                  setTimeLeft(timerConfig.longBreakTime * 60);
                  timeLeftRef.current = timerConfig.longBreakTime * 60;
                }
              }}
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
              className={`w-2 h-2 rounded-full ${isRunning ? 'animate-ping' : ''}`}
              style={{ backgroundColor: scene?.accentColor || '#fbbf24' }} 
            />
            <span className="uppercase tracking-widest text-[11px] font-medium">
              {isRunning ? 'Flow State Active (Accurate)' : 'Ready'}
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

        {/* StudyWithMe "I am working on..." Fully Customizable Task Section */}
        <div className="pt-2 space-y-2">
          {/* Active Task Pill with Full Custom Controls (NO forced 0/4) */}
          {activeTask ? (
            <div className="max-w-md mx-auto p-2.5 px-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-xs shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                
                {/* Left: Badge & Title */}
                <div className="flex items-center space-x-2 overflow-hidden text-left min-w-0">
                  {activeTask.rank && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-bold flex-shrink-0 ${rankBadgeColors[activeTask.rank] || rankBadgeColors['A']}`}>
                      {activeTask.rank}
                    </span>
                  )}
                  <div className="truncate font-medium text-white text-xs sm:text-sm">
                    {activeTask.title}
                  </div>
                </div>

                {/* Right: Customizable Progress Counter & Controls */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {/* Sessions badge: only shows target fraction IF target is defined */}
                  <div className="px-2 py-0.5 rounded-lg bg-white/10 font-mono text-amber-300 text-[11px] font-semibold">
                    {activeTask.targetSessions ? (
                      <span>{activeTask.completedSessions}/{activeTask.targetSessions}</span>
                    ) : (
                      <span>{activeTask.completedSessions} {activeTask.completedSessions === 1 ? 'session' : 'sessions'}</span>
                    )}
                  </div>

                  {/* Decrement session button */}
                  <button
                    type="button"
                    onClick={() => onTaskPomodoroDecrement && onTaskPomodoroDecrement(activeTask.id)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                    title="Subtract 1 session"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  {/* Increment session button */}
                  <button
                    type="button"
                    onClick={() => onTaskPomodoroIncrement && onTaskPomodoroIncrement(activeTask.id)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                    title="Add 1 session"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  {/* Edit task settings */}
                  <button
                    type="button"
                    onClick={() => setIsEditingTask(!isEditingTask)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-amber-300 transition-colors"
                    title="Edit task title or target sessions"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Clear / Dismiss Active Task */}
                  <button
                    type="button"
                    onClick={() => onClearActiveTask && onClearActiveTask()}
                    className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Clear active directive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Inline Edit Form for Active Task */}
              {isEditingTask && (
                <form onSubmit={handleSaveActiveTaskEdit} className="mt-3 pt-3 border-t border-white/10 space-y-2.5 animate-in slide-in-from-top-1">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block text-left">TITLE</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full mt-0.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block text-left">RANK</label>
                      <select
                        value={editRank}
                        onChange={(e) => setEditRank(e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="S">Rank S</option>
                        <option value="A">Rank A</option>
                        <option value="B">Rank B</option>
                        <option value="C">Rank C</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block text-left">TARGET SESSIONS</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Optional"
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        className="w-full mt-0.5 px-2 py-1 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingTask(false)}
                      className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Input form when no active task is set */
            <form onSubmit={handleTaskSubmit} className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="What are you working on right now?"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm font-sans focus:outline-none focus:border-white/50 text-center pr-12 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
                title="Set focus target"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
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
                  Glass
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

              <div>
                <div className="flex justify-between mb-1">
                  <span>Long Break Interval:</span>
                  <span className="text-amber-300 font-bold">Every {customLongInterval} rounds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={customLongInterval}
                  onChange={(e) => setCustomLongInterval(Number(e.target.value))}
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
                    longBreakTime: customLong,
                    longBreakInterval: customLongInterval
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
