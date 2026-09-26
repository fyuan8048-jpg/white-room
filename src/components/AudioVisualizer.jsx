import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, 
  Sliders, 
  X, 
  Sparkles, 
  Maximize2, 
  Palette, 
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { focusAudioSuite } from '../utils/audioSynthesizer';

export default function AudioVisualizer({
  isOpen,
  onClose,
  isPlayingMusic,
  acoustics,
  activeSceneColor = '#fbbf24'
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Visualizer settings (persisted in localStorage)
  const [mode, setMode] = useState(() => localStorage.getItem('whiteroom_viz_mode') || 'bars');
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('whiteroom_viz_color') || 'amber');
  const [position, setPosition] = useState(() => localStorage.getItem('whiteroom_viz_pos') || 'bottom'); // 'bottom' | 'center'
  const [sensitivity, setSensitivity] = useState(() => Number(localStorage.getItem('whiteroom_viz_sens')) || 1.2);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    localStorage.setItem('whiteroom_viz_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('whiteroom_viz_color', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('whiteroom_viz_pos', position);
  }, [position]);

  useEffect(() => {
    localStorage.setItem('whiteroom_viz_sens', sensitivity);
  }, [sensitivity]);

  // Color palletes for glowing canvas visualizer
  const PALETTES = {
    amber: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.45)',
      gradient: ['#fbbf24', '#f59e0b', '#d97706']
    },
    cyan: {
      primary: '#22d3ee',
      secondary: '#06b6d4',
      glow: 'rgba(34, 211, 238, 0.45)',
      gradient: ['#67e8f9', '#22d3ee', '#0891b2']
    },
    sakura: {
      primary: '#f472b6',
      secondary: '#ec4899',
      glow: 'rgba(244, 114, 182, 0.45)',
      gradient: ['#fbcfe8', '#f472b6', '#db2777']
    },
    emerald: {
      primary: '#34d399',
      secondary: '#10b981',
      glow: 'rgba(52, 211, 153, 0.45)',
      gradient: ['#a7f3d0', '#34d399', '#059669']
    },
    violet: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      glow: 'rgba(167, 139, 250, 0.45)',
      gradient: ['#c4b5fd', '#a78bfa', '#7c3aed']
    },
    scene: {
      primary: activeSceneColor,
      secondary: activeSceneColor,
      glow: `${activeSceneColor}66`,
      gradient: [activeSceneColor, '#fbbf24', '#f59e0b']
    }
  };

  const currentPalette = PALETTES[colorTheme] || PALETTES.amber;

  // Check if any soundscape is active
  const hasActiveNatureSound = Object.values(acoustics || {}).some(v => v > 0);
  const isAudioActive = isPlayingMusic || hasActiveNatureSound;

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Peak tracker for bars mode
    const numBars = 48;
    const peaks = new Array(numBars).fill(0);
    let phase = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Get real audio data or generate organic wave
      const rawData = focusAudioSuite.getAudioData();
      phase += isAudioActive ? 0.045 : 0.015;

      // Build 48 normalized frequency values (0.0 to 1.0)
      const values = [];
      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (rawData && rawData.length > 0) {
          const dataIdx = Math.floor((i / numBars) * (rawData.length / 2));
          val = (rawData[dataIdx] / 255.0) * sensitivity;
        }

        // Complement with organic harmonic motion if music is playing or audio is soft
        if (isAudioActive) {
          const rhythmicSwell = Math.sin(phase * 1.5 + i * 0.18) * 0.25 + Math.cos(phase * 2.2 + i * 0.3) * 0.15;
          val = Math.max(val, Math.max(0.08, rhythmicSwell + 0.35 * sensitivity));
        } else {
          // Gentle idle breathing wave
          val = 0.08 + 0.05 * Math.sin(phase + (i * Math.PI) / 12);
        }
        values.push(Math.min(1.0, val));
      }

      // 1. SPECTRUM BARS MODE
      if (mode === 'bars') {
        const barWidth = Math.max(2, (width / numBars) * 0.65);
        const gap = (width - barWidth * numBars) / (numBars + 1);

        for (let i = 0; i < numBars; i++) {
          const barHeight = Math.max(3, values[i] * (height * 0.85));
          const x = gap + i * (barWidth + gap);
          const y = height - barHeight;

          // Gradient fill
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, currentPalette.gradient[0]);
          grad.addColorStop(0.5, currentPalette.gradient[1]);
          grad.addColorStop(1, currentPalette.gradient[2] || currentPalette.secondary);

          ctx.fillStyle = grad;
          ctx.shadowColor = currentPalette.glow;
          ctx.shadowBlur = isAudioActive ? 12 : 4;

          // Rounded bar cap
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Floating peak indicator
          if (barHeight > peaks[i]) {
            peaks[i] = barHeight;
          } else {
            peaks[i] = Math.max(0, peaks[i] - 1.2);
          }

          if (peaks[i] > 4) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.fillRect(x, height - peaks[i] - 3, barWidth, 2);
          }
        }
      }

      // 2. GLOWING OSCILLOSCOPE WAVEFORM MODE
      else if (mode === 'waveform') {
        ctx.shadowColor = currentPalette.primary;
        ctx.shadowBlur = isAudioActive ? 16 : 8;
        ctx.lineWidth = isAudioActive ? 2.5 : 1.5;
        ctx.strokeStyle = currentPalette.primary;

        const centerY = height * 0.55;
        ctx.beginPath();

        for (let i = 0; i < width; i++) {
          const progress = i / width;
          const sampleIdx = Math.floor(progress * numBars);
          const amp = (values[sampleIdx] || 0.1) * (height * 0.38);

          const y = centerY + Math.sin(progress * 18 + phase * 2) * amp * Math.cos(progress * 8 - phase);
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();

        // Secondary subtle harmonic shadow wave
        ctx.lineWidth = 1;
        ctx.strokeStyle = currentPalette.secondary;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (let i = 0; i < width; i += 2) {
          const progress = i / width;
          const sampleIdx = Math.floor(progress * numBars);
          const amp = (values[sampleIdx] || 0.1) * (height * 0.22);
          const y = centerY + Math.sin(progress * 12 - phase * 1.5) * amp;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }

      // 3. RADIAL HALO / PULSE ORB MODE
      else if (mode === 'halo') {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.22;

        ctx.shadowColor = currentPalette.primary;
        ctx.shadowBlur = isAudioActive ? 20 : 10;
        ctx.lineWidth = 2;
        ctx.strokeStyle = currentPalette.primary;

        // Radiating pulse ring
        ctx.beginPath();
        const points = 64;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const valIdx = i % numBars;
          const offset = values[valIdx] * (baseRadius * 0.55);
          const r = baseRadius + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner glowing core
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
        coreGradient.addColorStop(0, currentPalette.glow);
        coreGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGradient;
        ctx.fill();
      }

      // 4. MINIMALIST HORIZON AUDIO RIBBON MODE
      else if (mode === 'horizon') {
        const centerY = height - 12;
        ctx.shadowColor = currentPalette.primary;
        ctx.shadowBlur = isAudioActive ? 14 : 6;
        ctx.lineWidth = 2;

        // Gradient filled ribbon
        const ribbonGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        ribbonGrad.addColorStop(0, currentPalette.glow);
        ribbonGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let i = 0; i <= width; i += 4) {
          const progress = i / width;
          const sampleIdx = Math.floor(progress * numBars);
          const amp = values[sampleIdx] * (height * 0.75);
          const y = centerY - amp * Math.abs(Math.sin(progress * 10 + phase));
          ctx.lineTo(i, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Edge stroke
        ctx.strokeStyle = currentPalette.primary;
        ctx.beginPath();
        for (let i = 0; i <= width; i += 4) {
          const progress = i / width;
          const sampleIdx = Math.floor(progress * numBars);
          const amp = values[sampleIdx] * (height * 0.75);
          const y = centerY - amp * Math.abs(Math.sin(progress * 10 + phase));
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, mode, colorTheme, sensitivity, isAudioActive]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-20 pointer-events-none transition-all duration-700 ease-out flex flex-col items-center select-none ${
        position === 'bottom' 
          ? 'bottom-20 left-0 right-0 px-4' 
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-2xl h-80'
      }`}
    >
      {/* Canvas Display */}
      <div className={`relative pointer-events-auto flex flex-col items-center ${position === 'bottom' ? 'w-full max-w-4xl h-24' : 'w-full h-full'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full drop-shadow-2xl"
        />

        {/* Minimalist Floating Quick Controls Bar */}
        <div className="absolute -top-10 flex items-center space-x-1.5 p-1 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 text-slate-200 shadow-2xl text-xs font-sans">
          
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded-xl transition-colors flex items-center space-x-1 text-xs ${
              showControls ? 'bg-amber-400 text-black font-bold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Visualizer Settings & Themes"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visualizer</span>
          </button>

          {/* Quick Mode Switcher */}
          <div className="flex items-center space-x-0.5 bg-white/5 p-0.5 rounded-xl border border-white/10">
            {[
              { id: 'bars', label: 'Bars' },
              { id: 'waveform', label: 'Wave' },
              { id: 'halo', label: 'Halo' },
              { id: 'horizon', label: 'Horizon' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                  mode === m.id 
                    ? 'bg-white text-black font-bold shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Position Toggle */}
          <button
            type="button"
            onClick={() => setPosition(position === 'bottom' ? 'center' : 'bottom')}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            title={position === 'bottom' ? "Move to Center (Behind Timer)" : "Move to Bottom Dock"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Visualizer */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Hide Audio Visualizer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Detailed Controls Popover */}
        {showControls && (
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-80 p-3.5 rounded-2xl bg-neutral-950/95 border border-white/15 shadow-2xl backdrop-blur-2xl text-xs font-sans space-y-3 z-30 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                <span>Audio Visualizer Colors</span>
              </span>
              <button onClick={() => setShowControls(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color Theme Pills */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'amber', label: 'White Room', color: 'bg-amber-400' },
                { id: 'cyan', label: 'Cyber Cyan', color: 'bg-cyan-400' },
                { id: 'sakura', label: 'Sakura Pink', color: 'bg-pink-400' },
                { id: 'emerald', label: 'Kyoto Zen', color: 'bg-emerald-400' },
                { id: 'violet', label: 'Synthwave', color: 'bg-purple-400' },
                { id: 'scene', label: 'Match Scene', color: 'bg-gradient-to-r from-amber-400 to-cyan-400' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setColorTheme(c.id)}
                  className={`p-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
                    colorTheme === c.id
                      ? 'border-white bg-white/15 font-bold text-white'
                      : 'border-white/10 hover:border-white/25 text-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                  <span className="text-[10px] truncate">{c.label}</span>
                </button>
              ))}
            </div>

            {/* Sensitivity Slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Audio Reactivity</span>
                <span className="font-mono text-amber-300">{Math.round(sensitivity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.2"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
