import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Film, 
  Link, 
  Trash2, 
  Check, 
  Sparkles,
  Plus,
  Volume2
} from 'lucide-react';
import { saveMediaBlob } from '../utils/mediaDB';

export default function ArtUploaderModal({
  isOpen,
  onClose,
  customScenes,
  onAddCustomScene,
  onDeleteCustomScene,
  onSelectScene,
  currentSceneId
}) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom Anime Art');
  const [mediaUrl, setMediaUrl] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [accentColor, setAccentColor] = useState('#fbbf24');
  const [isVideo, setIsVideo] = useState(false);
  const [enableSound, setEnableSound] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [rawFile, setRawFile] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    const videoDetected = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    setIsVideo(videoDetected);

    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewData(objectUrl);
    setMediaUrl(objectUrl);
  };

  const handleUrlChange = (val) => {
    setMediaUrl(val);
    setPreviewData(val);
    const videoDetected = /\.(mp4|webm|mov|mkv)($|\?)/i.test(val);
    setIsVideo(videoDetected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl) return;

    const sceneId = `custom-scene-${Date.now()}`;

    // If local file, save to IndexedDB
    if (rawFile) {
      await saveMediaBlob(sceneId, rawFile);
    }

    const newScene = {
      id: sceneId,
      name: name.trim() || (isVideo ? 'Custom Video Sanctuary' : 'Custom Anime Scene'),
      subname: isVideo ? 'Live Animated Video Wallpaper' : 'Sanctuary Artwork',
      category: category.trim() || (isVideo ? 'Live Video Wallpaper' : 'Custom Art'),
      artist: 'Custom Collection',
      quote: 'Stillness is where mastery begins.',
      speaker: 'White Room Archives',
      imageUrl: mediaUrl,
      videoUrl: isVideo ? mediaUrl : null,
      isVideo: isVideo,
      enableSound: isVideo ? enableSound : false,
      soundVolume: soundVolume,
      accentColor: accentColor,
      overlay: 'bg-black/35',
      tag: isVideo ? 'MP4 Video' : 'Custom',
      isCustom: true
    };

    onAddCustomScene(newScene);
    onSelectScene(newScene.id);

    setName('');
    setMediaUrl('');
    setPreviewData(null);
    setIsVideo(false);
    setEnableSound(false);
    setRawFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add Background Art & Video Wallpapers</h3>
              <p className="text-[11px] text-slate-400">Upload anime art or MP4 video live wallpapers with ambient sound</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Mode Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-sans">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tab === 'upload' ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image or MP4 Video</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tab === 'url' ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Image / Video Web URL</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
          
          {tab === 'upload' ? (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all p-3 text-center overflow-hidden">
              {previewData ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {isVideo ? (
                    <video src={previewData} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <img src={previewData} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  )}
                  <div className="absolute bottom-2 flex items-center space-x-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white">
                      {isVideo ? 'MP4 Video Detected' : 'Image Selected'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/90 text-black text-[10px] font-semibold">Change</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <div className="flex items-center space-x-2 text-amber-300">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-white font-bold">/</span>
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-slate-200">Click to select an image or MP4 video</span>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG, WebP, and MP4 / WebM videos</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*,video/mp4,video/webm,.mp4,.webm,.mov" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          ) : (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">IMAGE OR MP4 VIDEO DIRECT URL</label>
              <input
                type="url"
                placeholder="https://example.com/wallpaper.jpg or anime-live.mp4"
                value={mediaUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
              <label className="flex items-center space-x-2 mt-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isVideo}
                  onChange={(e) => setIsVideo(e.target.checked)}
                  className="rounded border-white/20 text-amber-400 focus:ring-0"
                />
                <span className="text-[10px]">Treat as animated video wallpaper</span>
              </label>
            </div>
          )}

          {/* Video Wallpaper Audio Options if video detected */}
          {isVideo && (
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold text-white text-xs">Play Sound from this Video Wallpaper</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => setEnableSound(e.target.checked)}
                  className="rounded border-white/20 text-amber-400 focus:ring-0 h-4 w-4"
                />
              </label>

              {enableSound && (
                <div className="flex items-center space-x-2 pt-1 border-t border-amber-400/20">
                  <span className="text-[10px] text-slate-300 w-24">Sound Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-amber-300 w-8 text-right">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">SCENE NAME</label>
              <input
                type="text"
                placeholder={isVideo ? "e.g. Rainy Shinjuku Video" : "e.g. My Ghibli Study"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ACCENT COLOR</label>
              <div className="flex items-center space-x-2 mt-1">
                {['#fbbf24', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`w-6 h-6 rounded-full border transition-all ${accentColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!mediaUrl}
            className="w-full py-2.5 rounded-xl bg-white text-black font-bold font-sans text-xs hover:bg-neutral-200 transition-all disabled:opacity-40 shadow-lg mt-2 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Apply as Active Background</span>
          </button>
        </form>

        {/* Custom Uploaded Scenes List */}
        {customScenes.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-sans text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Your Custom Backgrounds ({customScenes.length})</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {customScenes.map((cs) => {
                const isSelected = cs.id === currentSceneId;
                return (
                  <div
                    key={cs.id}
                    className={`relative rounded-xl overflow-hidden border p-1.5 flex items-center space-x-2 bg-white/5 transition-all ${
                      isSelected ? 'border-amber-400 ring-1 ring-amber-400' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black relative">
                      {cs.isVideo ? (
                        <video src={cs.videoUrl || cs.imageUrl} muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={cs.imageUrl} alt={cs.name} className="w-full h-full object-cover" />
                      )}
                      {cs.isVideo && (
                        <div className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 text-amber-300">
                          <Film className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="text-xs font-semibold text-white truncate">{cs.name}</div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onSelectScene(cs.id)}
                          className="text-[10px] text-amber-300 hover:underline"
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                        {cs.isVideo && cs.enableSound && (
                          <span className="text-[9px] text-emerald-400 flex items-center">
                            <Volume2 className="w-2.5 h-2.5 mr-0.5" /> Sound on
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteCustomScene(cs.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete background"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
