import React, { useState } from 'react';
import { 
  Music, 
  X, 
  Minimize2, 
  Maximize2, 
  ExternalLink, 
  Play, 
  Pause, 
  Radio, 
  Plus, 
  Volume2, 
  Tv, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const MEDIA_PRESETS = [
  {
    id: 'lofi-girl',
    title: 'Lofi Girl - Chill Beats',
    type: 'youtube',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1'
  },
  {
    id: 'ghibli-piano',
    title: 'Studio Ghibli Ambient Piano',
    type: 'youtube',
    url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1'
  },
  {
    id: 'synthwave-radio',
    title: 'Synthwave Radio - Chillwave',
    type: 'youtube',
    url: 'https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1'
  },
  {
    id: 'spotify-deep-focus',
    title: 'Spotify - Deep Focus Playlist',
    type: 'spotify',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0'
  }
];

export default function MediaEmbedPlayer({
  isOpen,
  onClose
}) {
  const [activeMedia, setActiveMedia] = useState(MEDIA_PRESETS[0]);
  const [customInputUrl, setCustomInputUrl] = useState('');
  
  // Player display mode: 'compact-audio' (audio pill, no giant window) | 'video-pip' | 'expanded'
  const [playerMode, setPlayerMode] = useState('compact-audio');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;

    let url = customInputUrl.trim();
    let type = 'youtube';

    // Parse YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      type = 'youtube';
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      if (videoId) {
        url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
    } else if (url.includes('spotify.com')) {
      type = 'spotify';
      if (!url.includes('/embed/')) {
        url = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
      }
    }

    setActiveMedia({
      id: `custom-${Date.now()}`,
      title: 'Custom Stream / Playlist',
      type,
      url
    });
    setCustomInputUrl('');
  };

  return (
    <div className="fixed z-40 select-none transition-all duration-300 bottom-20 right-6 sm:bottom-20 sm:right-6">
      
      {/* MODE 1: COMPACT BACKGROUND AUDIO PILL (Works without needing the full video window!) */}
      {playerMode === 'compact-audio' && (
        <div className="rounded-2xl glass-card-glow p-2 px-3 shadow-2xl text-slate-100 flex items-center space-x-3 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Pulsing Radio Icon */}
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 flex-shrink-0 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse text-rose-400" />
          </div>

          {/* Active Stream Info */}
          <div className="max-w-[150px] sm:max-w-[200px] truncate">
            <div className="text-[11px] font-bold text-white truncate flex items-center space-x-1">
              <span className="truncate">{activeMedia.title}</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Background Audio Active</span>
            </div>
          </div>

          {/* Preset Cycle Buttons */}
          <div className="flex items-center space-x-1">
            {MEDIA_PRESETS.map((p) => {
              const isSelected = activeMedia.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveMedia(p)}
                  className={`w-5 h-5 rounded-lg text-[9px] font-bold flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title={p.title}
                >
                  {p.title.charAt(0)}
                </button>
              );
            })}
          </div>

          {/* Controls: Expand Video Window or Close */}
          <div className="flex items-center space-x-1 pl-1 border-l border-white/10">
            <button
              onClick={() => setPlayerMode('expanded')}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all text-xs"
              title="Expand to Video View"
            >
              <Tv className="w-3.5 h-3.5 text-amber-300" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
              title="Stop and Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hidden/Persistent IFrame keeping audio alive without taking screen space */}
          <div className="w-1 h-1 overflow-hidden opacity-0 pointer-events-none absolute">
            <iframe
              src={activeMedia.url}
              title={activeMedia.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}

      {/* MODE 2: EXPANDED VIDEO WINDOW (When user wants to view video or add custom URL) */}
      {playerMode === 'expanded' && (
        <div className="w-80 sm:w-96 rounded-3xl glass-card-glow p-4 shadow-2xl text-slate-100 space-y-3 border border-white/20 animate-in fade-in zoom-in-95">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-sans">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 flex-shrink-0">
                <YoutubeIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-white text-xs truncate">{activeMedia.title}</div>
                <div className="text-[10px] text-slate-400">Stream Deck & Radio</div>
              </div>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setPlayerMode('compact-audio')}
                className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200 text-[10px] font-semibold flex items-center space-x-1 transition-all"
                title="Switch back to minimal audio-only bar"
              >
                <span>Audio Only</span>
                <Minimize2 className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                title="Close player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Player Frame */}
          <div className="w-full h-44 rounded-2xl overflow-hidden bg-black border border-white/10 relative shadow-inner">
            <iframe
              src={activeMedia.url}
              title={activeMedia.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 gap-1.5 font-sans text-[11px]">
            {MEDIA_PRESETS.map((m) => {
              const isSelected = activeMedia.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMedia(m)}
                  className={`p-2 rounded-xl border text-left transition-all truncate flex items-center space-x-1.5 ${
                    isSelected 
                      ? 'bg-rose-500/20 border-rose-400/50 text-white font-semibold' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <Radio className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="truncate">{m.title}</span>
                </button>
              );
            })}
          </div>

          {/* Custom URL Input */}
          <form onSubmit={handleCustomSubmit} className="flex items-center space-x-1.5 font-sans">
            <input
              type="url"
              placeholder="Paste YouTube or Spotify URL..."
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 shadow-md"
            >
              Load
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
