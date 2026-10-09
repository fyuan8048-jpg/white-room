import React, { useState, useEffect } from 'react';
import { X, Check, Edit2, RotateCcw, Palette, Film, Image as ImageIcon } from 'lucide-react';

export default function RenameBackgroundModal({
  isOpen,
  onClose,
  scene,
  onRename,
  onResetName,
  isDefaultScene = false,
  defaultName = ''
}) {
  const [newName, setNewName] = useState('');
  const [accentColor, setAccentColor] = useState('#fbbf24');

  useEffect(() => {
    if (scene) {
      setNewName(scene.name || '');
      setAccentColor(scene.accentColor || '#fbbf24');
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onRename(scene.id, newName.trim(), accentColor);
    onClose();
  };

  const handleReset = () => {
    if (onResetName) {
      onResetName(scene.id);
      onClose();
    }
  };

  const hasCustomName = isDefaultScene && defaultName && scene.name !== defaultName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Name Your Background</h3>
              <p className="text-[11px] text-slate-400">Give this wallpaper your own custom title</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/15 bg-black">
          {scene.isVideo ? (
            <video
              src={scene.videoUrl || scene.imageUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={scene.imageUrl}
              alt={scene.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/50"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-xs font-semibold text-white drop-shadow">
              {scene.category || 'Sanctuary Scene'}
            </span>
            {scene.isVideo && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1 border border-amber-400/40">
                <Film className="w-2.5 h-2.5 mr-1" />
                MP4 Video
              </span>
            )}
          </div>
        </div>

        {/* Rename Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="text-[11px] text-slate-300 block mb-1.5 font-semibold">
              BACKGROUND TITLE
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. My Shinjuku Rain, Kyoto Study, Midnight Neon..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              autoFocus
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              This name will appear in the bottom dock, header, and your wallpaper switcher.
            </span>
          </div>

          {/* Accent Glow Color */}
          <div>
            <label className="text-[11px] text-slate-300 block mb-1.5 font-semibold flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span>ACCENT COLOR DOT</span>
            </label>
            <div className="flex items-center space-x-2.5">
              {['#fbbf24', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#ffffff'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    accentColor === color ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {hasCustomName ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors text-xs"
                title={`Reset to original name: "${defaultName}"`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-md disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Name</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
