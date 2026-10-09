import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  User, 
  Sparkles,
  Compass,
  Flame,
  Clock,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Edit2
} from 'lucide-react';
import { getFocusSummary } from '../utils/focusStats';

export default function Header({
  scene,
  zenMode,
  onToggleZenMode,
  onOpenProfile,
  profile,
  currentUser,
  onOpenAuth,
  onLogout,
  focusStats,
  onOpenRenameScene
}) {
  const [time, setTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const summary = getFocusSummary(focusStats);

  const formatMins = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  return (
    <header className="relative z-30 w-full px-5 py-4 flex items-center justify-between text-slate-100 select-none">
      
      {/* Top Left: Logo & Scene Indicator */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 flex items-center justify-center font-bold text-sm tracking-wider text-amber-300 shadow-xl">
          WR
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-sm sm:text-base tracking-wide text-white drop-shadow">
              The White Room
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md border border-white/15 text-amber-200">
              {scene.category}
            </span>
          </div>
          <p 
            onClick={() => onOpenRenameScene && onOpenRenameScene(scene)}
            className="text-[11px] text-slate-300 drop-shadow flex items-center space-x-1.5 cursor-pointer group"
            title={`Background: "${scene.name}" (Click to rename)`}
          >
            <span className="font-medium text-white/90 group-hover:text-amber-300 transition-colors">{scene.name}</span>
            <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-300 opacity-60 group-hover:opacity-100 transition-all" />
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">{scene.tag}</span>
          </p>
        </div>
      </div>

      {/* Top Right: Actions & Student Status */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        
        {/* Real Daily Focus & Streak Badges */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-xs text-slate-200">
          <div className="flex items-center space-x-1 text-amber-300 font-bold" title="Current Daily Streak">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{summary.currentStreak}d</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="flex items-center space-x-1 text-slate-300" title="Today's Total Focus Time">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="font-mono">{formatMins(summary.todayFocusMinutes)}</span>
          </div>
        </div>

        {/* Subtle Live Clock */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-xs text-slate-200">
          <span 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: scene.accentColor || '#fbbf24' }} 
          />
          <span className="font-mono">
            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Zen Mode Button */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl border text-xs font-sans transition-all backdrop-blur-xl shadow-lg ${
            zenMode 
              ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-amber-400/20' 
              : 'bg-black/50 hover:bg-black/70 border-white/15 text-slate-200 hover:text-white'
          }`}
          title={zenMode ? "Show Timer & Controls" : "Zen View (Hide all UI)"}
        >
          {zenMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{zenMode ? 'Show Tools' : 'Zen View'}</span>
        </button>

        {/* Student Dossier / OAA Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/15 text-xs text-slate-200 hover:text-white backdrop-blur-xl shadow-lg transition-all"
          title="Customizable OAA Dossier & Daily Performance"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline font-mono font-bold text-amber-200">
            OAA {profile?.oaa?.overall || 'S'}
          </span>
        </button>

        {/* User Authentication / Profile Badge */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-black/60 hover:bg-black/80 border border-emerald-400/50 text-xs text-white backdrop-blur-xl shadow-lg transition-all"
              title={`Logged in as ${currentUser.displayName || currentUser.username}`}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[10px]">
                  {currentUser.displayName?.charAt(0) || currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
              </div>
              <span className="font-semibold text-xs max-w-[110px] truncate text-slate-100">
                {currentUser.displayName || currentUser.username}
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                {currentUser.studentId || 'WR-STUDENT'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-neutral-950/95 border border-white/15 shadow-2xl p-2 text-xs font-sans space-y-1 animate-in fade-in z-50">
                <div className="px-2.5 py-2 border-b border-white/10 bg-white/5 rounded-xl mb-1">
                  <div className="font-bold text-white truncate text-xs flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{currentUser.displayName || currentUser.username}</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono mt-0.5">ID: {currentUser.studentId || currentUser.username}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email || `${currentUser.username}@whiteroom`}</div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>View OAA Dossier</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Switch Account / Sign In</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg transition-all"
            title="Sign In or Register New Account"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}

      </div>

    </header>
  );
}
