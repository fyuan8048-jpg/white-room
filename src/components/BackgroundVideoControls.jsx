import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Film, 
  Sun, 
  Gauge, 
  Repeat, 
  X, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

export default function BackgroundVideoControls({
  videoRef,
  currentScene,
  isMuted,
  masterVolume,
  zenMode,
  brightness,
  onBrightnessChange
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(currentScene?.enableSound || false);
  const [videoVolume, setVideoVolume] = useState(currentScene?.soundVolume || 0.5);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with HTML5 video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      video.playbackRate = playbackRate;
      video.loop = isLooping;
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoRef, currentScene]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle Playback Rate (Speed)
  const changeSpeed = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Handle Seek / Progress
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const target = Number(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
  };

  // Handle Loop
  const toggleLoop = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isLooping;
    video.loop = next;
    setIsLooping(next);
  };

  // Handle Background Video Sound & Volume
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next && !isMuted) {
      video.volume = Math.max(0, Math.min(1, videoVolume * masterVolume));
      video.muted = false;
    } else {
      video.muted = true;
    }
  };

  const handleVolumeChange = (val) => {
    const video = videoRef.current;
    setVideoVolume(val);
    if (!video) return;
    if (soundEnabled && !isMuted) {
      video.volume = Math.max(0, Math.min(1, val * masterVolume));
      video.muted = false;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentScene?.isVideo || zenMode) return null;

  return (
    <div className="fixed top-20 right-5 z-40 font-sans select-none animate-in fade-in">
      
      {/* Minimized Quick Pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/20 text-xs text-slate-200 hover:text-white transition-all shadow-xl group"
          title="Background Video Playback Options"
        >
          <Film className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold text-[11px]">Video Wallpaper</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
            {isPlaying ? `${playbackRate}x` : 'Paused'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      ) : (
        /* Expanded Video Playback Deck */
        <div className="w-72 rounded-2xl bg-neutral-950/95 border border-white/15 p-4 shadow-2xl text-slate-100 space-y-3 backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          
          {/* Deck Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-amber-400" />
              <div className="font-bold text-white text-xs truncate max-w-[170px]">
                {currentScene.name || 'Video Wallpaper'}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Primary Controls: Play / Pause, Speed & Loop */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-bold transition-all shadow"
                title={isPlaying ? "Pause video animation" : "Resume video motion"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Restart video"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-1.5 rounded-xl border transition-all ${
                  isLooping ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-white/5 text-slate-400 border-white/10'
                }`}
                title={isLooping ? "Loop enabled" : "Loop disabled"}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-black/50 border border-white/10 text-[10px] font-mono">
              {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-1.5 py-0.5 rounded-lg transition-all ${
                    playbackRate === rate
                      ? 'bg-white text-black font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`${rate}x speed`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio from Video Wallpaper */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={toggleSound}
                className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors ${
                  soundEnabled && !isMuted ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {soundEnabled && !isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Video Wallpaper Audio</span>
              </button>
              <span className="text-[10px] font-mono text-slate-400">
                {soundEnabled && !isMuted ? `${Math.round(videoVolume * 100)}%` : 'Off'}
              </span>
            </div>

            {soundEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={videoVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                disabled={isMuted}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            )}
          </div>

          {/* Wallpaper Dimmer / Brightness Slider */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs">Wallpaper Brightness</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{Math.round(brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={brightness}
              onChange={(e) => onBrightnessChange && onBrightnessChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

        </div>
      )}

    </div>
  );
}
