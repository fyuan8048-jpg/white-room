import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Disc, 
  Sliders, 
  CloudRain, 
  Radio, 
  Waves, 
  Coffee, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { FOCUS_PLAYLIST } from '../utils/focusTracks';
import { focusAudioSuite } from '../utils/audioSynthesizer';

export default function AudioPlayerDeck({
  isMuted,
  onToggleMute,
  masterVolume,
  onMasterVolumeChange
}) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.65);
  const [isExpanded, setIsExpanded] = useState(false);

  // Acoustic noise sliders
  const [acoustics, setAcoustics] = useState({
    brownNoise: 0,
    rainOnGlass: 0,
    vinylCrackle: 0,
    cafeAmbience: 0,
    pinkNoise: 0,
    jazzRhodes: 0
  });

  const audioRef = useRef(null);

  const track = FOCUS_PLAYLIST[currentTrackIdx];

  // Initialize or handle audio stream
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.streamUrl);
      audioRef.current.crossOrigin = 'anonymous';
    } else {
      audioRef.current.src = track.streamUrl;
      if (isPlayingMusic) {
        audioRef.current.play().catch(() => {
          // If network stream is blocked, smoothly fallback to synthesized Rhodes Jazz!
          focusAudioSuite.setVolume('jazzRhodes', musicVolume);
        });
      }
    }
  }, [currentTrackIdx]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : musicVolume * masterVolume;
    }
  }, [musicVolume, masterVolume, isMuted]);

  const togglePlayMusic = () => {
    focusAudioSuite.ensureContext();
    if (isPlayingMusic) {
      if (audioRef.current) audioRef.current.pause();
      focusAudioSuite.setVolume('jazzRhodes', 0);
      setIsPlayingMusic(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlayingMusic(true);
        }).catch(() => {
          // Fallback to organic offline Rhodes Jazz synthesis
          focusAudioSuite.setVolume('jazzRhodes', musicVolume);
          setIsPlayingMusic(true);
        });
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % FOCUS_PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + FOCUS_PLAYLIST.length) % FOCUS_PLAYLIST.length);
  };

  const handleAcousticChange = (key, val) => {
    focusAudioSuite.ensureContext();
    const updated = { ...acoustics, [key]: val };
    setAcoustics(updated);
    if (!isMuted) {
      focusAudioSuite.setVolume(key, val);
    }
  };

  const activeAcousticCount = Object.values(acoustics).filter(v => v > 0).length;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm w-full transition-all duration-300">
      
      {/* Expanded Sound Mixer Drawer */}
      {isExpanded && (
        <div className="mb-2 p-5 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 text-slate-100 shadow-2xl space-y-4 animate-in slide-in-from-bottom-3 duration-200">
          
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-serif tracking-wider uppercase">
            <span className="flex items-center space-x-1.5 text-amber-300">
              <Sliders className="w-3.5 h-3.5" />
              <span>Acoustic Focus Chamber</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Soundscapes Presets */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                handleAcousticChange('brownNoise', 0.85);
                handleAcousticChange('rainOnGlass', 0.3);
                handleAcousticChange('vinylCrackle', 0.2);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all"
            >
              <div className="font-serif font-semibold text-amber-200">Deep Brown Nirvana</div>
              <div className="text-[10px] text-slate-400">Brown noise + soft rain</div>
            </button>
            <button
              onClick={() => {
                handleAcousticChange('brownNoise', 0);
                handleAcousticChange('rainOnGlass', 0.8);
                handleAcousticChange('vinylCrackle', 0.5);
                handleAcousticChange('cafeAmbience', 0.3);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all"
            >
              <div className="font-serif font-semibold text-blue-200">Rainy Jazz Bar</div>
              <div className="text-[10px] text-slate-400">Rain + vinyl needle + cafe</div>
            </button>
          </div>

          {/* Individual Sliders */}
          <div className="space-y-3 text-xs">
            {/* Deep Brown Noise */}
            <div className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-2 text-amber-200/90 w-36">
                <Waves className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-serif">Deep Brown Noise</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={acoustics.brownNoise}
                onChange={(e) => handleAcousticChange('brownNoise', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(acoustics.brownNoise * 100)}%
              </span>
            </div>

            {/* Rain on Glass */}
            <div className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-2 text-blue-200/90 w-36">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-serif">Rain on Glass</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={acoustics.rainOnGlass}
                onChange={(e) => handleAcousticChange('rainOnGlass', Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(acoustics.rainOnGlass * 100)}%
              </span>
            </div>

            {/* Vinyl Record Needle Crackle */}
            <div className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-2 text-rose-200/90 w-36">
                <Disc className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-serif">Vinyl Crackle</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={acoustics.vinylCrackle}
                onChange={(e) => handleAcousticChange('vinylCrackle', Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(acoustics.vinylCrackle * 100)}%
              </span>
            </div>

            {/* Cafe Ambience */}
            <div className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-2 text-orange-200/90 w-36">
                <Coffee className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-serif">Warm Cafe Drone</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={acoustics.cafeAmbience}
                onChange={(e) => handleAcousticChange('cafeAmbience', Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(acoustics.cafeAmbience * 100)}%
              </span>
            </div>

            {/* Pink Noise */}
            <div className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-2 text-cyan-200/90 w-36">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-serif">Velvet Pink Noise</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={acoustics.pinkNoise}
                onChange={(e) => handleAcousticChange('pinkNoise', Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(acoustics.pinkNoise * 100)}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
            <button
              onClick={() => {
                Object.keys(acoustics).forEach(k => handleAcousticChange(k, 0));
              }}
              className="text-slate-400 hover:text-white"
            >
              Reset Sounds
            </button>
            <span className="text-[11px] font-mono text-amber-300">
              {activeAcousticCount} Layers Active
            </span>
          </div>
        </div>
      )}

      {/* Floating Compact Audio Bar */}
      <div className="p-3 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/10 text-slate-100 shadow-2xl flex items-center justify-between gap-3">
        
        {/* Track Info with Spinning Vinyl Disc */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
            <img
              src={track.cover}
              alt="Track Artwork"
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                isPlayingMusic ? 'scale-105' : 'opacity-80'
              }`}
            />
            {isPlayingMusic && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc className="w-5 h-5 text-amber-300 animate-spin text-opacity-90" style={{ animationDuration: '4s' }} />
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <div className="font-serif font-bold text-xs truncate text-amber-100">
              {track.title}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {track.artist} · <span className="text-amber-400/80">{track.genre}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Previous Station"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlayMusic}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-all shadow-md active:scale-95"
            title={isPlayingMusic ? "Pause Focus Stream" : "Play Lo-Fi Jazz"}
          >
            {isPlayingMusic ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Next Station"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Sound Mixer Drawer Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition-all ${
              isExpanded || activeAcousticCount > 0
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Acoustic Noise Sliders (Brown noise, Rain, Vinyl)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted ? 'text-rose-400 hover:bg-rose-500/20' : 'text-slate-400 hover:text-white'
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

    </div>
  );
}
