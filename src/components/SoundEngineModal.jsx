import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Wind, 
  Server, 
  Activity, 
  Clock, 
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

export default function SoundEngineModal({
  isOpen,
  onClose,
  volumes,
  onVolumeChange,
  masterVolume,
  onMasterVolumeChange,
  isMuted,
  onToggleMute
}) {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'White Room Isolation',
      desc: 'Sterile AC hum + masking white noise',
      values: { rain: 0, whiteNoise: 0.5, chamberHum: 0.7, binaural: 0.2, clock: 0 }
    },
    {
      name: 'Rainy Solitude',
      desc: 'Deep rainfall + steady clock tick',
      values: { rain: 0.8, whiteNoise: 0, chamberHum: 0.2, binaural: 0, clock: 0.3 }
    },
    {
      name: 'Gamma Peak Bandwidth',
      desc: '40Hz cognitive binaural beats + subtle lab drone',
      values: { rain: 0, whiteNoise: 0.1, chamberHum: 0.4, binaural: 0.85, clock: 0 }
    },
    {
      name: 'Muted Void',
      desc: 'Pure silence',
      values: { rain: 0, whiteNoise: 0, chamberHum: 0, binaural: 0, clock: 0 }
    }
  ];

  const applyPreset = (presetValues) => {
    soundEngine.playClick();
    Object.keys(presetValues).forEach((track) => {
      onVolumeChange(track, presetValues[track]);
    });
  };

  const tracks = [
    {
      id: 'rain',
      name: 'Sanctuary Rain',
      desc: 'Soothing rainfall and atmospheric drizzle',
      icon: CloudRain,
      color: 'text-blue-400'
    },
    {
      id: 'whiteNoise',
      name: 'Clinical White Noise',
      desc: 'Speech masking and background silence',
      icon: Wind,
      color: 'text-cyan-400'
    },
    {
      id: 'chamberHum',
      name: 'Sterile Chamber Hum',
      desc: 'Low-frequency White Room air conditioning drone',
      icon: Server,
      color: 'text-indigo-400'
    },
    {
      id: 'binaural',
      name: '40Hz Gamma Focus Wave',
      desc: 'Binaural beats engineered for peak cognitive absorption',
      icon: Activity,
      color: 'text-rose-400'
    },
    {
      id: 'clock',
      name: 'Metronome Clock Tick',
      desc: 'Steady 1-second interval discipline rhythm',
      icon: Clock,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 sm:p-7 shadow-2xl text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl">Ambient Sound Matrix</h2>
              <p className="text-xs font-mono text-slate-400">Synthesized real-time focus audio generator</p>
            </div>
          </div>
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Control & Mute */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-xl border transition-colors ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div>
              <div className="text-xs font-mono font-semibold">Master Audio Level</div>
              <div className="text-[11px] font-mono text-slate-400">
                {isMuted ? 'All Output Muted' : `${Math.round(masterVolume * 100)}% Volume`}
              </div>
            </div>
          </div>

          <div className="w-40 sm:w-56">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
              disabled={isMuted}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sound Presets</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.values)}
                className="p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 bg-slate-950/40 hover:bg-slate-800/40 text-left transition-all group"
              >
                <div className="font-mono text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Channel Sliders */}
        <div className="space-y-3 font-mono text-xs">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Audio Channels
          </div>

          {tracks.map((track) => {
            const Icon = track.icon;
            const vol = volumes[track.id] || 0;
            return (
              <div 
                key={track.id} 
                className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${track.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center space-x-2">
                      <span>{track.name}</span>
                      {vol > 0 && !isMuted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">{track.desc}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 min-w-[160px]">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vol}
                    onChange={(e) => onVolumeChange(track.id, Number(e.target.value))}
                    disabled={isMuted}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 w-9 text-right font-mono">
                    {Math.round(vol * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-lg shadow-cyan-950/40"
          >
            Confirm Audio Parameters
          </button>
        </div>

      </div>
    </div>
  );
}
