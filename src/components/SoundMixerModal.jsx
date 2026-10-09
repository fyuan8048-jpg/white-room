import React, { useState } from 'react';
import { 
  X, 
  Waves, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Flame, 
  Droplets, 
  Sparkles, 
  Disc, 
  Coffee, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Clock, 
  Keyboard, 
  Music,
  Trees,
  Moon,
  Video,
  Film,
  Upload,
  Plus,
  Trash2,
  Link,
  Bell,
  Snowflake,
  TreePine,
  Anchor,
  Tent,
  Zap,
  Activity,
  Layers,
  Check
} from 'lucide-react';
import { saveMediaBlob } from '../utils/mediaDB';
import { SOUNDSCAPE_PRESETS } from '../utils/audioSynthesizer';

export default function SoundMixerModal({
  isOpen,
  onClose,
  acoustics,
  onAcousticChange,
  isMuted,
  onToggleMute,
  masterVolume,
  onMasterVolumeChange,
  customSounds = [],
  onAddCustomSound,
  onUpdateCustomSoundVolume,
  onDeleteCustomSound,
  binauralState = { type: 'none', volume: 0.5 },
  onBinauralChange,
  phaseConfig,
  onUpdatePhaseConfig,
  allScenes = []
}) {
  const [activeCategory, setActiveCategory] = useState('nature'); // 'nature' | 'living' | 'noises' | 'binaural' | 'automation' | 'custom'
  
  // Custom sound loop upload state
  const [customName, setCustomName] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIsVideo, setCustomIsVideo] = useState(false);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'url'

  if (!isOpen) return null;

  const applyPreset = (values) => {
    Object.keys(values).forEach((k) => onAcousticChange(k, values[k]));
  };

  const soundCategories = {
    nature: {
      name: 'Nature & Elements',
      icon: Trees,
      tracks: [
        { key: 'bambooFountain', name: 'Bamboo Fountain (Shishi-Odoshi)', desc: 'Zen garden trickling water & bamboo knock', icon: Droplets, color: 'text-emerald-400' },
        { key: 'oceanWaves', name: 'Ocean Shoreline Waves', desc: 'Rhythmic, deep ocean swells', icon: Waves, color: 'text-cyan-400' },
        { key: 'forestRain', name: 'Forest Rain on Leaves', desc: 'Soothing rain through foliage', icon: CloudRain, color: 'text-blue-400' },
        { key: 'waterfall', name: 'Cascading Mountain Waterfall', desc: 'Powerful, continuous alpine water roar', icon: Waves, color: 'text-sky-300' },
        { key: 'rainOnTent', name: 'Rain on Canvas & Window', desc: 'Crisp rhythmic droplet taps on roof', icon: Tent, color: 'text-blue-300' },
        { key: 'blizzardWind', name: 'Winter Blizzard Snowstorm', desc: 'Cold howling gale whistling outside', icon: Snowflake, color: 'text-cyan-200' },
        { key: 'forestWind', name: 'Forest Wind & Canopy', desc: 'Gentle breeze rustling branches', icon: Wind, color: 'text-emerald-300' },
        { key: 'autumnLeaves', name: 'Autumn Foliage Whisper', desc: 'Crisp dry leaves rustling underfoot', icon: TreePine, color: 'text-amber-500' },
        { key: 'thunderstorm', name: 'Distant Thunderstorm', desc: 'Sub-bass rolling thunder rumbles', icon: CloudLightning, color: 'text-purple-400' },
        { key: 'campfire', name: 'Campfire & Fireplace', desc: 'Warm wood snaps & gentle flame hiss', icon: Flame, color: 'text-amber-400' },
        { key: 'waterStream', name: 'Mountain Water Brook', desc: 'Babbling clear river stream', icon: Droplets, color: 'text-teal-400' },
        { key: 'underwater', name: 'Submerged Oceanic Depths', desc: 'Deep muffled aquatic womb resonance', icon: Anchor, color: 'text-indigo-400' },
      ]
    },
    living: {
      name: 'Living Ambience',
      icon: Moon,
      tracks: [
        { key: 'zenSingingBowl', name: 'Tibetan Singing Bowl', desc: 'Resonant harmonic meditative brass bell', icon: Bell, color: 'text-amber-300' },
        { key: 'morningBirds', name: 'Morning Forest Birds', desc: 'Peaceful woodland chirps & melodies', icon: Sparkles, color: 'text-emerald-300' },
        { key: 'nightCrickets', name: 'Night Crickets & Cicadas', desc: 'Peaceful summer evening solitude', icon: Moon, color: 'text-indigo-300' },
        { key: 'pondFrogs', name: 'Woodland Pond Wildlife', desc: 'Gentle evening frogs & marsh water', icon: Droplets, color: 'text-teal-300' },
        { key: 'cafeAmbience', name: 'Cozy Cafe Murmur', desc: 'Warm coffee shop background drone', icon: Coffee, color: 'text-orange-400' },
        { key: 'vinylCrackle', name: 'Vinyl Turntable Needle', desc: 'Vintage analog surface crackle', icon: Disc, color: 'text-rose-400' },
        { key: 'keyboardTyping', name: 'Soft Mechanical Typing', desc: 'Gentle rhythmic study typing', icon: Keyboard, color: 'text-amber-200' },
        { key: 'clockTick', name: 'Clock Metronome', desc: 'Steady 1-second focus rhythm', icon: Clock, color: 'text-yellow-300' },
      ]
    },
    noises: {
      name: 'Focus Frequencies',
      icon: Waves,
      tracks: [
        { key: 'brownNoise', name: 'Deep Brown Noise', desc: 'Velvety waterfall noise for deep focus', icon: Waves, color: 'text-amber-400' },
        { key: 'pinkNoise', name: 'Velvet Pink Noise', desc: 'Balanced gentle speech masking', icon: Sparkles, color: 'text-pink-400' },
        { key: 'whiteNoise', name: 'Gentle White Noise', desc: 'Crisp background noise barrier', icon: Wind, color: 'text-slate-300' },
        { key: 'jazzRhodes', name: 'Rhodes Jazz Chords', desc: 'Warm acoustic jazz chord progressions', icon: Music, color: 'text-amber-300' },
      ]
    }
  };

  const handleCustomFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setCustomFileName(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name);
    setCustomIsVideo(isVideo);

    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleAddCustomLoopSubmit = async (e) => {
    e.preventDefault();
    let url = customUrl;
    const id = `custom-sound-${Date.now()}`;

    if (uploadTab === 'file' && customFile) {
      url = URL.createObjectURL(customFile);
      await saveMediaBlob(id, customFile);
    }

    if (!url) return;

    const newSound = {
      id,
      name: customName.trim() || (customIsVideo ? 'Custom Video Sound Loop' : 'Custom Sound Loop'),
      isVideo: customIsVideo,
      url,
      volume: 0.6
    };

    if (onAddCustomSound) {
      onAddCustomSound(newSound);
    }

    setCustomName('');
    setCustomFile(null);
    setCustomFileName('');
    setCustomUrl('');
    setCustomIsVideo(false);
  };

  const activeProceduralCount = Object.values(acoustics).filter(v => v > 0).length;
  const activeCustomCount = customSounds.filter(s => s.volume > 0).length;
  const isBinauralActive = binauralState && binauralState.type !== 'none' && binauralState.volume > 0;
  const totalActiveCount = activeProceduralCount + activeCustomCount + (isBinauralActive ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Focus Soundscapes & Frequencies</h3>
              <p className="text-[11px] text-slate-400">Natural soundscapes, 40Hz Gamma binaural waves, and study/rest automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Control */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-sans">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/10 text-white border-white/10'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div>
              <div className="font-semibold text-white">Master Audio Level</div>
              <div className="text-[10px] text-slate-400">{isMuted ? 'Muted' : `${Math.round(masterVolume * 100)}% Volume`}</div>
            </div>
          </div>

          <div className="w-36">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
              disabled={isMuted}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* 1-Click Presets Carousel */}
        <div>
          <div className="text-[11px] font-sans text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>1-Click Soundscape Presets</span>
            <span className="text-amber-300 font-mono text-[10px]">{totalActiveCount} Active Layers</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOUNDSCAPE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.values)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white group-hover:text-amber-200 truncate">{p.name}</span>
                  <span className="text-[9px] px-1 rounded bg-white/10 text-amber-300 font-mono">{p.tag}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-sans overflow-x-auto">
          {Object.entries(soundCategories).map(([key, cat]) => {
            const Icon = cat.icon;
            const isTabActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl transition-all flex-shrink-0 ${
                  isTabActive ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}

          {/* Binaural Beats Tab */}
          <button
            onClick={() => setActiveCategory('binaural')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl transition-all flex-shrink-0 ${
              activeCategory === 'binaural' ? 'bg-purple-400 text-black font-semibold shadow' : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Binaural Waves</span>
            {isBinauralActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
          </button>

          {/* Study & Rest Automation Tab */}
          <button
            onClick={() => setActiveCategory('automation')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl transition-all flex-shrink-0 ${
              activeCategory === 'automation' ? 'bg-emerald-400 text-black font-semibold shadow' : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Study/Rest Auto</span>
          </button>

          {/* Custom MP4 / Video Sounds */}
          <button
            onClick={() => setActiveCategory('custom')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl transition-all flex-shrink-0 ${
              activeCategory === 'custom' ? 'bg-amber-400 text-black font-semibold shadow' : 'text-amber-300/80 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="truncate">Custom Loops</span>
          </button>
        </div>

        {/* Tab 1, 2, 3: Natural Acoustic Sliders */}
        {['nature', 'living', 'noises'].includes(activeCategory) && (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs font-sans">
            {soundCategories[activeCategory].tracks.map((t) => {
              const Icon = t.icon;
              const val = acoustics[t.key] || 0;
              return (
                <div key={t.key} className="flex items-center justify-between space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center space-x-2.5 w-44">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${t.color}`} />
                    <div className="overflow-hidden">
                      <div className="font-medium text-white text-xs truncate flex items-center space-x-1.5">
                        <span>{t.name}</span>
                        {val > 0 && !isMuted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{t.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-1 max-w-[190px]">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={val}
                      onChange={(e) => onAcousticChange(t.key, Number(e.target.value))}
                      disabled={isMuted}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right flex-shrink-0">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Binaural Waves Generator */}
        {activeCategory === 'binaural' && (
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Stereo Binaural Focus Waves</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Best with headphones. Generates frequency differential between left & right ears.
                </p>
              </div>

              {binauralState?.type !== 'none' && (
                <button
                  onClick={() => onBinauralChange && onBinauralChange('none', 0)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px]"
                >
                  Turn Off
                </button>
              )}
            </div>

            {/* Wave Options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gamma40', name: '40Hz Gamma', desc: 'Peak cognitive focus & logic solving', tag: 'High Intensity' },
                { id: 'alpha10', name: '10Hz Alpha', desc: 'Flow state, relaxed alertness & reading', tag: 'Flow & Calm' },
                { id: 'theta6', name: '6Hz Theta', desc: 'Deep memory retention & meditation', tag: 'Rest & Recall' },
              ].map((w) => {
                const isActive = binauralState?.type === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => onBinauralChange && onBinauralChange(isActive ? 'none' : w.id, binauralState?.volume || 0.5)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive 
                        ? 'bg-purple-500/25 border-purple-400 text-white ring-1 ring-purple-400 shadow-lg' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span>{w.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                    </div>
                    <div className="text-[10px] text-purple-300 font-mono mt-0.5">{w.tag}</div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{w.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Volume control */}
            {binauralState?.type !== 'none' && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between space-x-3">
                <span className="text-[11px] text-slate-300 font-medium">Binaural Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={binauralState?.volume || 0.5}
                  onChange={(e) => onBinauralChange && onBinauralChange(binauralState.type, Number(e.target.value))}
                  className="flex-1 accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-purple-300 w-8 text-right">
                  {Math.round((binauralState?.volume || 0.5) * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Study / Rest Auto-Transitions Engine */}
        {activeCategory === 'automation' && (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Phase Theme & Audio Transitions</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Automatically switch background wallpaper & soundscape between Study, Short Rest, and Long Rest!
                </p>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <input
                  type="checkbox"
                  checked={phaseConfig?.autoSwitchAudio ?? true}
                  onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ autoSwitchAudio: e.target.checked })}
                  className="accent-emerald-400 rounded"
                />
                <span className="text-white text-xs font-semibold">Auto-Switch On</span>
              </label>
            </div>

            {/* Phase Grid */}
            <div className="space-y-3">
              {/* 1. Study Mode */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>1. STUDY & DEEP FOCUS</span>
                  <span className="text-[10px] text-slate-400 font-normal">Active Pomodoro / Flowtime</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">THEME WALLPAPER</label>
                    <select
                      value={phaseConfig?.studySceneId || 'cote-white-room'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ studySceneId: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {allScenes.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AUDIO SOUNDSCAPE</label>
                    <select
                      value={phaseConfig?.studyPreset || 'tokyo-midnight-rain'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ studyPreset: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {SOUNDSCAPE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Short Rest */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span>2. SHORT REST & COFFEE BREAK</span>
                  <span className="text-[10px] text-slate-400 font-normal">5 - 10 min break</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">THEME WALLPAPER</label>
                    <select
                      value={phaseConfig?.shortBreakSceneId || 'ghibli-sanctuary-desk'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ shortBreakSceneId: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {allScenes.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AUDIO SOUNDSCAPE</label>
                    <select
                      value={phaseConfig?.shortBreakPreset || 'kyoto-bamboo-sanctuary'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ shortBreakPreset: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {SOUNDSCAPE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Long Rest */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span>3. LONG REST & RECOVERY</span>
                  <span className="text-[10px] text-slate-400 font-normal">15 - 30 min recovery</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">THEME WALLPAPER</label>
                    <select
                      value={phaseConfig?.longBreakSceneId || 'ghibli-midnight-library'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ longBreakSceneId: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {allScenes.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AUDIO SOUNDSCAPE</label>
                    <select
                      value={phaseConfig?.longBreakPreset || 'solitary-campfire-night'}
                      onChange={(e) => onUpdatePhaseConfig && onUpdatePhaseConfig({ longBreakPreset: e.target.value })}
                      className="w-full p-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white"
                    >
                      {SOUNDSCAPE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 6: Custom Sound Loops */}
        {activeCategory === 'custom' && (
          <div className="space-y-3 font-sans text-xs">
            <form onSubmit={handleAddCustomLoopSubmit} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add MP4 Video or Audio Sound Loop</span>
                </span>
                
                <div className="flex items-center space-x-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setUploadTab('file')}
                    className={`px-2 py-0.5 rounded-lg ${uploadTab === 'file' ? 'bg-white/20 text-white' : 'text-slate-400'}`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTab('url')}
                    className={`px-2 py-0.5 rounded-lg ${uploadTab === 'url' ? 'bg-white/20 text-white' : 'text-slate-400'}`}
                  >
                    Direct URL
                  </button>
                </div>
              </div>

              {uploadTab === 'file' ? (
                <label className="flex items-center justify-between p-2.5 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl cursor-pointer bg-black/30 hover:bg-black/40 transition-all">
                  <div className="flex items-center space-x-2">
                    {customIsVideo ? <Video className="w-4 h-4 text-amber-300" /> : <Upload className="w-4 h-4 text-slate-400" />}
                    <span className="text-slate-300 truncate max-w-[240px]">
                      {customFileName || 'Choose MP4, WebM, or Audio file'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-medium">
                    {customIsVideo ? 'VIDEO SOUND' : 'Browse'}
                  </span>
                  <input
                    type="file"
                    accept="video/*,audio/*,.mp4,.webm,.mov,.mkv,.mp3,.wav,.m4a"
                    onChange={handleCustomFile}
                    className="hidden"
                  />
                </label>
              ) : (
                <input
                  type="url"
                  placeholder="https://example.com/sound-ambience.mp4"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setCustomIsVideo(/\.(mp4|webm|mov|mkv)($|\?)/i.test(e.target.value));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Sound Name (e.g. Rainy Window MP4)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={uploadTab === 'file' ? !customFile : !customUrl}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-all disabled:opacity-40 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Layer</span>
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {customSounds.length === 0 ? (
                <div className="p-4 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5">
                  <Film className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs">No custom MP4 video sound loops added yet.</p>
                </div>
              ) : (
                customSounds.map((s) => {
                  const val = s.volume || 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-center space-x-2.5 w-44">
                        {s.isVideo ? <Video className="w-4 h-4 text-amber-300 flex-shrink-0" /> : <Music className="w-4 h-4 text-cyan-300 flex-shrink-0" />}
                        <div className="overflow-hidden">
                          <div className="font-medium text-white text-xs truncate">{s.name}</div>
                          <div className="text-[10px] text-amber-400/80 font-mono">{s.isVideo ? 'MP4 Video Loop' : 'Audio Loop'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-1 max-w-[190px]">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={val}
                          onChange={(e) => onUpdateCustomSoundVolume && onUpdateCustomSoundVolume(s.id, Number(e.target.value))}
                          disabled={isMuted}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteCustomSound && onDeleteCustomSound(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors flex-shrink-0"
                          title="Delete loop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs font-sans">
          <button
            onClick={() => {
              Object.keys(acoustics).forEach(k => onAcousticChange(k, 0));
              if (onBinauralChange) onBinauralChange('none', 0);
              if (customSounds.length > 0 && onUpdateCustomSoundVolume) {
                customSounds.forEach(s => onUpdateCustomSoundVolume(s.id, 0));
              }
            }}
            className="text-slate-400 hover:text-white"
          >
            Reset All Audio
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold font-sans text-xs hover:bg-neutral-200"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
