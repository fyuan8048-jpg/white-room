import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sliders, 
  BookOpen, 
  Lightbulb, 
  Terminal, 
  MessageSquare, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Disc, 
  Plus,
  Music,
  Upload,
  Video,
  Film,
  Edit2,
  Users,
  FileText,
  Sun,
  Moon
} from 'lucide-react';

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function BottomDock({
  scenes,
  currentSceneId,
  onSelectScene,
  activeWidget,
  onToggleWidget,
  isMuted,
  onToggleMute,
  isPlayingMusic,
  onTogglePlayMusic,
  currentTrack,
  onNextTrack,
  onPrevTrack,
  tasksCount,
  thoughtsCount,
  commentsCount,
  onOpenSoundModal,
  onOpenArtUploader,
  onOpenMusicUploader,
  showVideoVisualizer,
  onToggleVideoVisualizer,
  onOpenRenameScene,
  onOpenNotebook,
  isBuddiesOpen,
  onToggleBuddies,
  isMediaEmbedOpen,
  onToggleMediaEmbed,
  dayNightProfile,
  onToggleDayNight
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none select-none">
      
      {/* 1. Bottom-Left: Lo-Fi Jazz & Custom Music Player */}
      <div className="pointer-events-auto flex items-center p-2 sm:p-2.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 text-slate-100 shadow-2xl max-w-xs w-full sm:w-auto">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 mr-3">
          <img
            src={currentTrack.cover}
            alt="Track"
            className={`w-full h-full object-cover ${isPlayingMusic ? 'scale-105' : 'opacity-80'}`}
          />
          {isPlayingMusic && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <Disc className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          )}
        </div>

        <div className="mr-3 overflow-hidden min-w-[90px]">
          <div className="font-sans font-bold text-xs truncate text-amber-100 flex items-center space-x-1">
            <span className="truncate">{currentTrack.title}</span>
            {currentTrack.isVideo && (
              <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[8px] font-bold flex-shrink-0">
                MP4
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentTrack.artist}
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={onPrevTrack}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlayMusic}
            className="p-1.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow"
            title={isPlayingMusic ? "Pause" : "Play"}
          >
            {isPlayingMusic ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onNextTrack}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Mini Video Visualizer if track is a video */}
          {currentTrack.isVideo && (
            <button
              onClick={onToggleVideoVisualizer}
              className={`p-1.5 rounded-lg border transition-all ${
                showVideoVisualizer
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
              title={showVideoVisualizer ? "Hide Video Window (Sound Only)" : "Show MP4 Video Window"}
            >
              <Video className="w-3 h-3" />
            </button>
          )}

          {/* Add / Manage Tracks Button */}
          <button
            onClick={onOpenMusicUploader}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10 ml-0.5"
            title="Add your own music / track list"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Bottom-Center: Scene Switcher Carousel + Upload Art Button */}
      <div className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-x-auto max-w-full space-x-1">
        {scenes.map((s) => {
          const isSelected = s.id === currentSceneId;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScene(s.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (onOpenRenameScene) onOpenRenameScene(s);
              }}
              title={`${s.name} (Click to apply · Right-click or ✎ to rename)`}
              className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all duration-200 flex-shrink-0 ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: s.accentColor }} 
              />
              <span className="truncate max-w-[120px]">{s.name}</span>
              {s.isVideo && (
                <Film className="w-2.5 h-2.5 text-amber-300 ml-0.5 flex-shrink-0" />
              )}
              {isSelected && onOpenRenameScene && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRenameScene(s);
                  }}
                  className="p-0.5 ml-1 rounded hover:bg-black/15 text-neutral-600 hover:text-black transition-colors"
                  title="Rename this background"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}

        {/* Upload Custom Background Art Button */}
        <button
          onClick={onOpenArtUploader}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 flex-shrink-0 font-medium transition-all"
          title="Upload or link your own anime wallpaper"
        >
          <Upload className="w-3 h-3" />
          <span>Add Art</span>
        </button>
      </div>

      {/* 3. Bottom-Right: Tool Widgets Pill & Fullscreen Toggle */}
      <div className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 text-slate-100 shadow-2xl space-x-1">
        
        {/* Ambient Natural Sounds Mixer */}
        <button
          onClick={onOpenSoundModal}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
            activeWidget === 'sounds'
              ? 'bg-amber-400/25 text-amber-300 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="24 Natural Soundscapes (Bamboo, Waterfall, Waves, Rain, Campfire)"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Sounds</span>
        </button>

        {/* In-App Study Notes & Flashcards */}
        <button
          onClick={onOpenNotebook}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="In-App Study Notebook & Flashcards"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden lg:inline">Notes</span>
        </button>

        {/* Silent Study Room Avatars */}
        <button
          onClick={onToggleBuddies}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-sans transition-all ${
            isBuddiesOpen
              ? 'bg-cyan-400/25 text-cyan-300 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Silent Study Room Avatars (Library Immersion)"
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Buddies</span>
        </button>

        {/* YouTube & Spotify Focus Streams Deck */}
        <button
          onClick={onToggleMediaEmbed}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-sans transition-all ${
            isMediaEmbedOpen
              ? 'bg-rose-500/25 text-rose-300 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="YouTube & Spotify Focus Stream Deck"
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden lg:inline">Radio</span>
        </button>

        {/* Dynamic Day/Night & Weather Cycle Button */}
        <button
          onClick={onToggleDayNight}
          className="flex items-center p-1.5 rounded-xl text-xs font-sans text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title={`Day/Night & Weather: ${dayNightProfile?.name || 'Synced with time'} (Click to cycle)`}
        >
          {dayNightProfile?.accentDot === '#6366f1' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          )}
        </button>

        {/* Tasks */}
        <button
          onClick={() => onToggleWidget('tasks')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
            activeWidget === 'tasks'
              ? 'bg-white text-black font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Curriculum Directives / Tasks"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tasks</span>
          <span className="text-[10px] opacity-75">({tasksCount})</span>
        </button>

        {/* Thoughts / Brainstorming */}
        <button
          onClick={() => onToggleWidget('brainstorm')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
            activeWidget === 'brainstorm'
              ? 'bg-white text-black font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Cold Calculation Board"
        >
          <Lightbulb className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">Thoughts</span>
        </button>

        {/* Reflections / Comments on Last 5 Sessions */}
        <button
          onClick={() => onToggleWidget('comments')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
            activeWidget === 'comments'
              ? 'bg-white text-black font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Session Logs & Reflections (Last 5)"
        >
          <MessageSquare className="w-3.5 h-3.5 text-rose-300" />
          <span className="hidden sm:inline">Logs</span>
          <span className="text-[10px] opacity-75">({commentsCount})</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleBrowserFullscreen}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (F11)"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

      </div>

    </footer>
  );
}
