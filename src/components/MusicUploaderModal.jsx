import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Music, 
  Video, 
  Film, 
  Link, 
  Trash2, 
  Play, 
  Pause, 
  Plus, 
  Radio, 
  Check, 
  Volume2, 
  Sparkles 
} from 'lucide-react';
import { saveMediaBlob } from '../utils/mediaDB';

export default function MusicUploaderModal({
  isOpen,
  onClose,
  playlist,
  onAddTrack,
  onDeleteTrack,
  currentTrackIdx,
  onSelectTrack,
  isPlaying
}) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Video Sound / Focus');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isVideoFile, setIsVideoFile] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewRef = React.useRef(null);

  if (!isOpen) return null;

  const handleMediaFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setFileName(file.name);

    // Check if the file is a video
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);
    setIsVideoFile(isVideo);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }
    if (!artist) {
      setArtist(isVideo ? 'MP4 Video Soundtrack' : 'Local Audio Track');
    }
    if (isVideo && genre === 'Lo-Fi / Focus Jazz') {
      setGenre('MP4 Ambient Focus Sound');
    }

    // Create a local blob URL for playback
    const objectUrl = URL.createObjectURL(file);
    setMediaUrl(objectUrl);
  };

  const handleUrlChange = (val) => {
    setMediaUrl(val);
    const isVideo = /\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(val);
    setIsVideoFile(isVideo);
    if (isVideo && (!title || title === 'Custom Audio Stream')) {
      setTitle('MP4 Video Audio Stream');
      setArtist('Web Video Sound');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl) return;

    const trackId = `custom-track-${Date.now()}`;

    // If it's a local file, persist the actual blob in IndexedDB for permanent storage
    if (rawFile) {
      await saveMediaBlob(trackId, rawFile);
    }

    const newTrack = {
      id: trackId,
      title: title.trim() || (isVideoFile ? 'My Video Focus Sound' : 'My Focus Track'),
      artist: artist.trim() || (isVideoFile ? 'MP4 Video Audio' : 'Custom Artist'),
      genre: genre.trim() || (isVideoFile ? 'MP4 Video Sound' : 'Custom Focus Music'),
      cover: isVideoFile
        ? 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
      streamUrl: mediaUrl,
      isVideo: isVideoFile,
      isCustom: true
    };

    onAddTrack(newTrack);
    setTitle('');
    setArtist('');
    setMediaUrl('');
    setFileName('');
    setIsVideoFile(false);
    setRawFile(null);
    if (previewRef.current) {
      previewRef.current.pause();
    }
    onClose();
  };

  const togglePreviewPlay = () => {
    if (!previewRef.current) return;
    if (previewPlaying) {
      previewRef.current.pause();
      setPreviewPlaying(false);
    } else {
      previewRef.current.play().then(() => setPreviewPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-950/95 border border-white/15 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 font-sans">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Music & Video Sounds Suite</h3>
              <p className="text-[11px] text-slate-400">Add MP4 video files, audio tracks, or video stream URLs as focus sounds</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewRef.current) previewRef.current.pause();
              onClose();
            }}
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
            <span>Upload MP4 / Audio File</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tab === 'url' ? 'bg-white text-black font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Video / Audio Stream URL</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
          
          {tab === 'upload' ? (
            <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all p-3 text-center">
              {fileName ? (
                <div className="flex flex-col items-center space-y-1.5 text-amber-300 font-semibold">
                  <div className="flex items-center space-x-2">
                    {isVideoFile ? <Video className="w-5 h-5 text-amber-400" /> : <Music className="w-5 h-5 text-amber-300" />}
                    <span className="truncate max-w-[280px]">{fileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isVideoFile ? 'bg-amber-400 text-black' : 'bg-white/20 text-white'
                    }`}>
                      {isVideoFile ? 'MP4 / VIDEO SOUND DETECTED' : 'AUDIO FILE'}
                    </span>
                    <span className="text-[10px] text-slate-400">Click to change file</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                  <div className="flex items-center space-x-2 text-amber-300">
                    <Video className="w-5 h-5" />
                    <span className="text-white font-bold">/</span>
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-200">Click to choose an MP4 Video or Audio file</span>
                  <span className="text-[10px] text-slate-500">Supports .mp4, .webm, .mov, .mkv, .mp3, .wav, .m4a</span>
                </div>
              )}
              <input 
                type="file" 
                accept="video/*,audio/*,.mp4,.webm,.mov,.mkv,.m4v,.mp3,.wav,.m4a,.ogg,.flac" 
                onChange={handleMediaFile} 
                className="hidden" 
              />
            </label>
          ) : (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">DIRECT MP4 VIDEO OR AUDIO STREAM URL</label>
              <input
                type="url"
                placeholder="https://example.com/focus-ambience.mp4 or stream.mp3"
                value={mediaUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center space-x-3 mt-1.5">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isVideoFile}
                    onChange={(e) => setIsVideoFile(e.target.checked)}
                    className="rounded border-white/20 text-amber-400 focus:ring-0"
                  />
                  <span className="text-[10px]">Treat as MP4 / Video Sound</span>
                </label>
              </div>
            </div>
          )}

          {/* Quick Media Preview Player if selected */}
          {mediaUrl && (
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={togglePreviewPlay}
                  className="p-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 transition-all font-bold shadow"
                >
                  {previewPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate max-w-[200px]">
                    {title || 'Testing Sound'}
                  </div>
                  <div className="text-[10px] text-amber-300/80 flex items-center space-x-1">
                    <Volume2 className="w-3 h-3" />
                    <span>{isVideoFile ? 'Playing audio track from video' : 'Playing audio preview'}</span>
                  </div>
                </div>
              </div>

              {/* Hidden or mini media element for test listening */}
              <video
                ref={previewRef}
                src={mediaUrl}
                playsInline
                onEnded={() => setPreviewPlaying(false)}
                className="hidden"
              />

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                {isVideoFile ? 'MP4 AUDIO' : 'AUDIO'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TRACK / SOUND NAME</label>
              <input
                type="text"
                placeholder={isVideoFile ? "e.g. Rainy Tokyo Video Sound" : "e.g. Late Night Rhodes"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ARTIST / SOURCE</label>
              <input
                type="text"
                placeholder={isVideoFile ? "e.g. Video Soundclip" : "e.g. White Room Archive"}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">GENRE / CATEGORY</label>
            <input
              type="text"
              placeholder="e.g. MP4 Video Focus / Rainy Ambience"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={!mediaUrl}
            className="w-full py-2.5 rounded-xl bg-white text-black font-bold font-sans text-xs hover:bg-neutral-200 transition-all disabled:opacity-40 shadow-lg mt-2 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Focus Sound Library</span>
          </button>
        </form>

        {/* Existing Playlist & Custom Tracks */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-sans text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Focus Sounds & Music ({playlist.length})</span>
            <span className="text-[10px] text-amber-300">Supports MP4 & Audio</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {playlist.map((track, idx) => {
              const isCurrent = idx === currentTrackIdx;
              return (
                <div
                  key={track.id || idx}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-400/10 border-amber-400/50 text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                    <button
                      onClick={() => onSelectTrack(idx)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isCurrent && isPlaying
                          ? 'bg-amber-400 text-black font-bold'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                          {track.title}
                        </div>
                        {track.isVideo && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold flex items-center space-x-0.5 flex-shrink-0">
                            <Video className="w-2.5 h-2.5 mr-0.5" />
                            <span>MP4 VIDEO</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {track.artist} • <span className="opacity-75">{track.genre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {track.isCustom && (
                      <button
                        onClick={() => onDeleteTrack(track.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove custom track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
