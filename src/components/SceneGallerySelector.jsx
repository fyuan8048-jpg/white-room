import React from 'react';
import { Image as ImageIcon, Sparkles, Check, X } from 'lucide-react';
import { ART_SCENES } from '../utils/artScenes';

export default function SceneGallerySelector({
  isOpen,
  onClose,
  currentSceneId,
  onSelectScene
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-neutral-950/90 border border-white/10 p-6 sm:p-8 text-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 font-serif text-sm tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Sanctuary Aesthetics & Fine Art Gallery</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-white font-semibold mt-1">
              Select Focus Canvas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Museum masterpieces, White Room architectural brutalism, and jazz sanctuaries
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {ART_SCENES.map((scene) => {
            const isSelected = scene.id === currentSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  onSelectScene(scene.id);
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden border text-left transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-950/40' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={scene.imageUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Category & Status Pill */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-serif bg-black/60 backdrop-blur-md border border-white/20 text-slate-200">
                      {scene.category}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Title & Info on artwork */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif font-bold text-sm text-white leading-tight">
                      {scene.name}
                    </h3>
                    <div className="text-[11px] text-amber-200/90 font-serif flex items-center justify-between mt-0.5">
                      <span>{scene.artist}</span>
                      <span className="text-slate-400 text-[10px]">{scene.vibeTag}</span>
                    </div>
                  </div>
                </div>

                {/* Quote snippet */}
                <div className="p-3 bg-black/70 backdrop-blur-md border-t border-white/5 text-[11px] text-slate-300 italic font-serif leading-relaxed line-clamp-2">
                  "{scene.quote}"
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs text-slate-400">
          <span>High-definition architectural & fine art curation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif transition-colors"
          >
            Close Gallery
          </button>
        </div>

      </div>
    </div>
  );
}
