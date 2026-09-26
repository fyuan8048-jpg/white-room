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
  Link
} from 'lucide-react';
import { saveMediaBlob } from '../utils/mediaDB';

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
  onDeleteCustomSound
}) {
  const [activeCategory, setActiveCategory] = useState('nature'); // 'nature' | 'living' | 'noises' | 'custom'
  
  // Custom sound loop upload state
  const [customName, setCustomName] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIsVideo, setCustomIsVideo] = useState(false);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'url'

  if (!isOpen) return null;

  const presets = [
    {
      name: 'Rainy Forest Solitude',
      desc: 'Forest rain + distant thunder & wind',
      values: { forestRain: 0.8, thunderstorm: 0.5, forestWind: 0.4, campfire: 0, oceanWaves: 0, brownNoise: 0, morningBirds: 0, nightCrickets: 0 }
    },
    {
      name: 'Night Campfire by the Lake',
      desc: 'Campfire + gentle ocean waves & crickets',
      values: { campfire: 0.8, oceanWaves: 0.5, nightCrickets: 0.4, forestRain: 0, thunderstorm: 0, brownNoise: 0, forestWind: 0.2 }
    },
    {
      name: 'Deep Brown Cognitive Flow',
      desc: 'Velvety brown noise + water stream & clock',
      values: { brownNoise: 0.85, waterStream: 0.4, clockTick: 0.2, forestRain: 0, campfire: 0, oceanWaves: 0 }
    },
    {
      name: 'Ghibli Rainy Jazz Cafe',
      desc: 'Vinyl needle crackle + cafe murmur & rain',
      values: { vinylCrackle: 0.6, cafeAmbience: 0.5, forestRain: 0.6, jazzRhodes: 0.4, campfire: 0, brownNoise: 0 }
    },
    {
      name: 'Morning Zen Sanctuary',
      desc: 'Morning birds + mountain stream & breeze',
      values: { morningBirds: 0.6, waterStream: 0.5, forestWind: 0.35, brownNoise: 0, campfire: 0 }
    },
    {
      name: 'Pure Silence',
      desc: 'Reset all active layers',
      values: {
        brownNoise: 0, oceanWaves: 0, campfire: 0, forestRain: 0, thunderstorm: 0,
        forestWind: 0, waterStream: 0, nightCrickets: 0, morningBirds: 0,
        keyboardTyping: 0, vinylCrackle: 0, cafeAmbience: 0, pinkNoise: 0,
        whiteNoise: 0, clockTick: 0, jazzRhodes: 0
      }
    }
  ];

  const applyPreset = (values) => {
    Object.keys(values).forEach((k) => onAcousticChange(k, values[k]));
  };

  const soundCategories = {
    nature: {
      name: 'Nature & Elements',
      icon: Trees,
      tracks: [
        { key: 'oceanWaves', name: 'Ocean Shoreline Waves', desc: 'Rhythmic, deep ocean swells', icon: Waves, color: 'text-cyan-400' },
        { key: 'forestRain', name: 'Forest Rain on Leaves', desc: 'Soothing rain through foliage', icon: CloudRain, color: 'text-blue-400' },
        { key: 'thunderstorm', name: 'Distant Thunderstorm', desc: 'Sub-bass rolling thunder rumbles', icon: CloudLightning, color: 'text-purple-400' },
        { key: 'forestWind', name: 'Forest Wind & Leaves', desc: 'Gentle breeze rustling branches', icon: Wind, color: 'text-emerald-400' },
        { key: 'campfire', name: 'Campfire & Fireplace', desc: 'Warm wood snaps & gentle flame hiss', icon: Flame, color: 'text-amber-400' },
        { key: 'waterStream', name: 'Mountain Water Brook', desc: 'Babbling clear river stream', icon: Droplets, color: 'text-teal-400' },
      ]
    },
    living: {
      name: 'Living Ambience',
      icon: Moon,
      tracks: [
        { key: 'morningBirds', name: 'Morning Forest Birds', desc: 'Peaceful woodland chirps', icon: Sparkles, color: 'text-emerald-300' },
        { key: 'nightCrickets', name: 'Night Crickets & Cicadas', desc: 'Peaceful summer evening solitude', icon: Moon, color: 'text-indigo-300' },
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
  const totalActiveCount = activeProceduralCount + activeCustomCount;

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
              <h3 className="font-bold text-base text-white">Natural Soundscapes & Video Sound Matrix</h3>
              <p className="text-[11px] text-slate-400">16 Organic soundscapes + Custom MP4 video sound loops</p>
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
              <div className="font-semibold text-white">Master Sound Level</div>
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

        {/* Presets Carousel */}
        <div>
          <div className="text-[11px] font-sans text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Natural Soundscapes Presets</span>
            <span className="text-amber-300 font-mono text-[10px]">{totalActiveCount} Layers Active</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.values)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all text-xs group"
              >
                <div className="font-semibold text-white group-hover:text-amber-200 truncate">{p.name}</div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-sans">
          {Object.entries(soundCategories).map(([key, cat]) => {
            const Icon = cat.icon;
            const isTabActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl transition-all ${
                  isTabActive ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}

          {/* 4th Tab: Custom MP4 & Audio Sounds */}
          <button
            onClick={() => setActiveCategory('custom')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl transition-all ${
              activeCategory === 'custom' ? 'bg-amber-400 text-black font-semibold shadow' : 'text-amber-300/80 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="truncate">MP4 / Video Sounds</span>
            {customSounds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[9px] font-bold">
                {customSounds.length}
              </span>
            )}
          </button>
        </div>

        {/* Sliders Grid for Active Category */}
        {activeCategory !== 'custom' ? (
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
        ) : (
          /* Custom MP4 Video & Audio Sound Loops Section */
          <div className="space-y-3 font-sans text-xs">
            
            {/* Inline Add Custom Sound Loop */}
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

            {/* List of active custom sound loops */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {customSounds.length === 0 ? (
                <div className="p-4 text-center text-slate-500 bg-white/5 rounded-2xl border border-white/5">
                  <Film className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs">No custom MP4 video sound loops added yet.</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Upload any MP4 video or audio file to mix it as an ambient loop!</p>
                </div>
              ) : (
                customSounds.map((s) => {
                  const val = s.volume || 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-center space-x-2.5 w-44">
                        {s.isVideo ? (
                          <Video className="w-4 h-4 text-amber-300 flex-shrink-0" />
                        ) : (
                          <Music className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <div className="font-medium text-white text-xs truncate flex items-center space-x-1.5">
                            <span>{s.name}</span>
                            {val > 0 && !isMuted && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                          <div className="text-[10px] text-amber-400/80 font-mono">
                            {s.isVideo ? 'MP4 Video Sound Loop' : 'Audio Loop'}
                          </div>
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
                        <span className="text-[10px] font-mono text-slate-400 w-8 text-right flex-shrink-0">
                          {Math.round(val * 100)}%
                        </span>
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

        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs font-sans">
          <button
            onClick={() => {
              Object.keys(acoustics).forEach(k => onAcousticChange(k, 0));
              if (customSounds.length > 0 && onUpdateCustomSoundVolume) {
                customSounds.forEach(s => onUpdateCustomSoundVolume(s.id, 0));
              }
            }}
            className="text-slate-400 hover:text-white"
          >
            Reset All Sounds
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
