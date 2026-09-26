import React, { useEffect, useRef } from 'react';
import { getMediaBlob } from '../utils/mediaDB';

export default function CustomSoundLoopPlayer({
  sound,
  isMuted,
  masterVolume
}) {
  const mediaRef = useRef(null);

  // Restore blob URL from IndexedDB if needed
  useEffect(() => {
    let active = true;
    async function restoreBlob() {
      if (sound.id && (!sound.url || sound.url.startsWith('blob:'))) {
        const blob = await getMediaBlob(sound.id);
        if (blob && active && mediaRef.current) {
          mediaRef.current.src = URL.createObjectURL(blob);
          if (sound.volume > 0 && !isMuted) {
            mediaRef.current.play().catch(() => {});
          }
        }
      }
    }
    restoreBlob();
    return () => {
      active = false;
    };
  }, [sound.id]);

  // Volume & Mute management
  useEffect(() => {
    if (!mediaRef.current) return;

    const targetVolume = isMuted ? 0 : (sound.volume || 0) * masterVolume;
    mediaRef.current.volume = Math.max(0, Math.min(1, targetVolume));

    if (targetVolume > 0 && !isMuted) {
      if (mediaRef.current.paused) {
        mediaRef.current.play().catch(() => {});
      }
    } else {
      if (!mediaRef.current.paused) {
        mediaRef.current.pause();
      }
    }
  }, [sound.volume, isMuted, masterVolume]);

  return (
    <video
      ref={mediaRef}
      src={sound.url}
      playsInline
      loop
      className="hidden"
    />
  );
}
