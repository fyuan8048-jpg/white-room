import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StudyWithMeTimer from './components/StudyWithMeTimer';
import BottomDock from './components/BottomDock';
import SoundMixerModal from './components/SoundMixerModal';
import ArtUploaderModal from './components/ArtUploaderModal';
import MusicUploaderModal from './components/MusicUploaderModal';
import TasksCurriculum from './components/TasksCurriculum';
import BrainstormBoard from './components/BrainstormBoard';
import SessionLogsFeed from './components/SessionLogsFeed';
import OAAProfileModal from './components/OAAProfileModal';
import CustomSoundLoopPlayer from './components/CustomSoundLoopPlayer';
import AuthModal from './components/AuthModal';
import BackgroundVideoControls from './components/BackgroundVideoControls';

import { ANIME_SCENES } from './utils/artScenes';
import { FOCUS_PLAYLIST } from './utils/focusTracks';
import { getInitialData, saveToStorage, loadFromStorage } from './utils/storage';
import { focusAudioSuite } from './utils/audioSynthesizer';
import { getMediaBlob, deleteMediaBlob } from './utils/mediaDB';
import { 
  getCurrentUser, 
  logoutUser, 
  loadUserData, 
  saveUserData, 
  ensureDemoAccount 
} from './utils/auth';
import { 
  loadDailyStats, 
  saveDailyStats, 
  recordCompletedSession, 
  getEmptyStats 
} from './utils/focusStats';
import { Video, Film, Eye, EyeOff, X } from 'lucide-react';

export default function App() {
  // Current Authenticated User (or null for Guest)
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authToast, setAuthToast] = useState(null);
  const isSwitchingUserRef = useRef(false);
  const userId = currentUser?.id || null;

  // Real Daily Focus Stats & Streak tracking (User scoped or Global)
  const [focusStats, setFocusStats] = useState(() => {
    return userId ? loadUserData(userId, 'focus_stats', getEmptyStats()) : loadDailyStats();
  });

  const initialData = getInitialData();

  // Custom User Scenes & Video Wallpapers (User scoped or Global)
  const [customScenes, setCustomScenes] = useState(() => {
    return userId ? loadUserData(userId, 'custom_scenes', []) : loadFromStorage('custom_scenes', []);
  });

  const allScenes = [...ANIME_SCENES, ...customScenes];

  // Selected Anime Scene
  const [sceneId, setSceneId] = useState(() => {
    return localStorage.getItem('whiteroom_anime_scene') || 'cote-white-room';
  });

  // Custom User Tracks (Audio & MP4 Video Sounds)
  const [customTracks, setCustomTracks] = useState(() => {
    return userId ? loadUserData(userId, 'custom_tracks', []) : loadFromStorage('custom_tracks', []);
  });

  const allTracks = [...FOCUS_PLAYLIST, ...customTracks];

  // Custom Multi-channel Sound Loops (MP4 Video & Audio Loops)
  const [customSoundLayers, setCustomSoundLayers] = useState(() => {
    return userId ? loadUserData(userId, 'custom_sound_layers', []) : loadFromStorage('custom_sound_layers', []);
  });

  const [tasks, setTasks] = useState(() => {
    return userId ? loadUserData(userId, 'tasks', []) : initialData.tasks;
  });
  const [activeTaskId, setActiveTaskId] = useState(null);

  const [brainstormCards, setBrainstormCards] = useState(() => {
    return userId ? loadUserData(userId, 'cards', []) : initialData.brainstormCards;
  });

  const [sessionLogs, setSessionLogs] = useState(() => {
    return userId ? loadUserData(userId, 'session_logs', []) : (initialData.sessionLogs || []);
  });

  const [profile, setProfile] = useState(() => {
    if (userId) {
      return loadUserData(userId, 'profile', {
        studentName: currentUser?.displayName || currentUser?.username || 'Ayanokoji Kiyotaka',
        studentId: currentUser?.studentId || 'WR-GEN4-401',
        generation: currentUser?.generation || '4th Generation Curriculum',
        status: 'Masterpiece',
        classRank: currentUser?.classRank || 'Class 1-D / Rank S',
        totalFocusMinutes: 0,
        sessionsCompleted: 0
      });
    }
    return initialData.profile;
  });

  const [timerConfig, setTimerConfig] = useState(initialData.timerConfig);

  // Active floating widget overlay: null | 'tasks' | 'brainstorm' | 'comments'
  const [activeWidget, setActiveWidget] = useState(null);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isArtUploaderOpen, setIsArtUploaderOpen] = useState(false);
  const [isMusicUploaderOpen, setIsMusicUploaderOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showVideoVisualizer, setShowVideoVisualizer] = useState(true);
  const [bgBrightness, setBgBrightness] = useState(1.0);

  // Music & Audio State
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.7);

  // Acoustic natural sound mixer sliders (24 natural sounds)
  const [acoustics, setAcoustics] = useState({
    brownNoise: 0,
    oceanWaves: 0,
    campfire: 0,
    forestRain: 0,
    thunderstorm: 0,
    forestWind: 0,
    waterStream: 0,
    nightCrickets: 0,
    morningBirds: 0,
    keyboardTyping: 0,
    vinylCrackle: 0,
    cafeAmbience: 0,
    pinkNoise: 0,
    whiteNoise: 0,
    clockTick: 0,
    jazzRhodes: 0,
    bambooFountain: 0,
    waterfall: 0,
    blizzardWind: 0,
    autumnLeaves: 0,
    rainOnTent: 0,
    pondFrogs: 0,
    zenSingingBowl: 0,
    underwater: 0
  });

  const mediaPlayerRef = useRef(null);
  const bgVideoRef = useRef(null);

  const currentScene = allScenes.find(s => s.id === sceneId) || allScenes[0];
  const currentTrack = allTracks[currentTrackIdx] || allTracks[0];

  // Initialize demo account on startup
  useEffect(() => {
    ensureDemoAccount();
  }, []);

  // Persistence - Scoped to User Account if logged in
  useEffect(() => {
    localStorage.setItem('whiteroom_anime_scene', sceneId);
  }, [sceneId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'custom_scenes', customScenes);
    else saveToStorage('custom_scenes', customScenes);
  }, [customScenes, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'custom_tracks', customTracks);
    else saveToStorage('custom_tracks', customTracks);
  }, [customTracks, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'custom_sound_layers', customSoundLayers);
    else saveToStorage('custom_sound_layers', customSoundLayers);
  }, [customSoundLayers, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'tasks', tasks);
    else saveToStorage('tasks', tasks);
  }, [tasks, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'cards', brainstormCards);
    else saveToStorage('cards', brainstormCards);
  }, [brainstormCards, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'session_logs', sessionLogs.slice(0, 5));
    else saveToStorage('session_logs', sessionLogs.slice(0, 5));
  }, [sessionLogs, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'profile', profile);
    else saveToStorage('profile', profile);
  }, [profile, userId]);

  useEffect(() => {
    if (isSwitchingUserRef.current) return;
    if (userId) saveUserData(userId, 'focus_stats', focusStats);
    else saveDailyStats(focusStats);
  }, [focusStats, userId]);

  useEffect(() => {
    saveToStorage('timer_config', timerConfig);
  }, [timerConfig]);

  // Auto-dismiss auth toast notification
  useEffect(() => {
    if (!authToast) return;
    const timer = setTimeout(() => {
      setAuthToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [authToast]);

  // Handle Authentication Success (Login or Sign Up)
  const handleAuthSuccess = (user) => {
    isSwitchingUserRef.current = true;
    const uid = user.id;
    setCurrentUser(user);

    // Load this user's isolated data
    setTasks(loadUserData(uid, 'tasks', []));
    setBrainstormCards(loadUserData(uid, 'cards', []));
    setSessionLogs(loadUserData(uid, 'session_logs', []));
    setCustomScenes(loadUserData(uid, 'custom_scenes', []));
    setCustomTracks(loadUserData(uid, 'custom_tracks', []));
    setCustomSoundLayers(loadUserData(uid, 'custom_sound_layers', []));
    setFocusStats(loadUserData(uid, 'focus_stats', getEmptyStats()));
    setProfile(loadUserData(uid, 'profile', {
      studentName: user.displayName || user.username,
      studentId: user.studentId || 'WR-GEN4-401',
      generation: user.generation || '4th Generation Curriculum',
      status: 'Active Scholar',
      classRank: user.classRank || 'Class 1-D / Rank S',
      totalFocusMinutes: 0,
      sessionsCompleted: 0
    }));

    setAuthToast({
      type: 'success',
      message: `Signed in as ${user.displayName || user.username} (${user.studentId || 'WR-STUDENT'})`
    });

    setTimeout(() => {
      isSwitchingUserRef.current = false;
    }, 150);
  };

  // Handle Sign Out
  const handleLogout = () => {
    isSwitchingUserRef.current = true;
    logoutUser();
    setCurrentUser(null);
    const initial = getInitialData();
    setTasks(initial.tasks);
    setBrainstormCards(initial.brainstormCards);
    setSessionLogs(initial.sessionLogs);
    setProfile(initial.profile);
    setFocusStats(loadDailyStats());
    setCustomScenes(loadFromStorage('custom_scenes', []));
    setCustomTracks(loadFromStorage('custom_tracks', []));
    setCustomSoundLayers(loadFromStorage('custom_sound_layers', []));

    setAuthToast({
      type: 'info',
      message: 'Signed out of White Room Sanctuary. Guest session active.'
    });

    setTimeout(() => {
      isSwitchingUserRef.current = false;
    }, 150);
  };

  // Restore blobs from IndexedDB across page reloads
  useEffect(() => {
    let mounted = true;
    async function restoreBlobs() {
      // 1. Restore custom tracks (MP4 video sounds & audio)
      if (customTracks.length > 0) {
        const restoredTracks = await Promise.all(
          customTracks.map(async (t) => {
            if (t.isCustom) {
              const blob = await getMediaBlob(t.id);
              if (blob) {
                return { ...t, streamUrl: URL.createObjectURL(blob) };
              }
            }
            return t;
          })
        );
        if (mounted) setCustomTracks(restoredTracks);
      }

      // 2. Restore custom scenes (video wallpapers)
      if (customScenes.length > 0) {
        const restoredScenes = await Promise.all(
          customScenes.map(async (s) => {
            if (s.isCustom && s.isVideo) {
              const blob = await getMediaBlob(s.id);
              if (blob) {
                const objUrl = URL.createObjectURL(blob);
                return { ...s, imageUrl: objUrl, videoUrl: objUrl };
              }
            }
            return s;
          })
        );
        if (mounted) setCustomScenes(restoredScenes);
      }

      // 3. Restore custom sound loops
      if (customSoundLayers.length > 0) {
        const restoredLayers = await Promise.all(
          customSoundLayers.map(async (l) => {
            const blob = await getMediaBlob(l.id);
            if (blob) {
              return { ...l, url: URL.createObjectURL(blob) };
            }
            return l;
          })
        );
        if (mounted) setCustomSoundLayers(restoredLayers);
      }
    }

    restoreBlobs();
    return () => {
      mounted = false;
    };
  }, []);

  // Background Video Wallpaper Ambient Audio management
  useEffect(() => {
    if (bgVideoRef.current && currentScene?.isVideo) {
      if (currentScene.enableSound && !isMuted) {
        const bgVol = Math.max(0, Math.min(1, (currentScene.soundVolume || 0.5) * masterVolume));
        bgVideoRef.current.volume = bgVol;
        bgVideoRef.current.muted = false;
      } else {
        bgVideoRef.current.muted = true;
      }
    }
  }, [currentScene, isMuted, masterVolume]);

  // Universal Media Player for Audio & MP4 Video Sounds - POSITIVE STOP & CLEAN RELOAD
  useEffect(() => {
    if (!mediaPlayerRef.current) return;

    if (isPlayingMusic && currentTrack?.streamUrl) {
      mediaPlayerRef.current.src = currentTrack.streamUrl;
      mediaPlayerRef.current.volume = isMuted ? 0 : musicVolume * masterVolume;
      mediaPlayerRef.current.play().catch(() => {
        focusAudioSuite.setVolume('jazzRhodes', musicVolume);
      });
    } else {
      mediaPlayerRef.current.pause();
      mediaPlayerRef.current.currentTime = 0;
      mediaPlayerRef.current.src = "";
      mediaPlayerRef.current.load();
      focusAudioSuite.setVolume('jazzRhodes', 0);
      focusAudioSuite.stopTrack('jazzRhodes');
    }
  }, [currentTrackIdx, currentTrack, isPlayingMusic]);

  useEffect(() => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.volume = isMuted ? 0 : musicVolume * masterVolume;
    }
  }, [musicVolume, masterVolume, isMuted]);

  // Reliable Play/Pause toggle
  const handleTogglePlayMusic = () => {
    focusAudioSuite.ensureContext();
    if (isPlayingMusic) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.pause();
        mediaPlayerRef.current.currentTime = 0;
        mediaPlayerRef.current.src = "";
        mediaPlayerRef.current.load();
      }
      focusAudioSuite.setVolume('jazzRhodes', 0);
      focusAudioSuite.stopTrack('jazzRhodes');
      setIsPlayingMusic(false);
    } else {
      setIsPlayingMusic(true);
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % allTracks.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + allTracks.length) % allTracks.length);
  };

  const handleSelectTrack = (idx) => {
    setCurrentTrackIdx(idx);
    setIsPlayingMusic(true);
  };

  const handleAddCustomTrack = (track) => {
    setCustomTracks([track, ...customTracks]);
    setCurrentTrackIdx(allTracks.length);
    setIsPlayingMusic(true);
  };

  const handleDeleteCustomTrack = async (id) => {
    setCustomTracks(customTracks.filter(t => t.id !== id));
    await deleteMediaBlob(id);
  };

  // Custom Sound Loops handlers (for SoundMixer)
  const handleAddCustomSound = (sound) => {
    setCustomSoundLayers([sound, ...customSoundLayers]);
  };

  const handleUpdateCustomSoundVolume = (id, volume) => {
    setCustomSoundLayers(customSoundLayers.map(s => s.id === id ? { ...s, volume } : s));
  };

  const handleDeleteCustomSound = async (id) => {
    setCustomSoundLayers(customSoundLayers.filter(s => s.id !== id));
    await deleteMediaBlob(id);
  };

  // Custom Scenes & Wallpapers handlers
  const handleAddCustomScene = (newScene) => {
    setCustomScenes([newScene, ...customScenes]);
    setSceneId(newScene.id);
  };

  const handleDeleteCustomScene = async (id) => {
    setCustomScenes(customScenes.filter(s => s.id !== id));
    await deleteMediaBlob(id);
    if (sceneId === id) setSceneId('cote-white-room');
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      focusAudioSuite.setMasterVolume(0);
      setIsMuted(true);
    } else {
      focusAudioSuite.setMasterVolume(masterVolume);
      setIsMuted(false);
    }
  };

  const handleMasterVolumeChange = (val) => {
    setMasterVolume(val);
    if (!isMuted) {
      focusAudioSuite.setMasterVolume(val);
    }
  };

  const handleAcousticChange = (key, val) => {
    focusAudioSuite.ensureContext();
    const updated = { ...acoustics, [key]: val };
    setAcoustics(updated);
    if (!isMuted) {
      focusAudioSuite.setVolume(key, val);
    }
  };

  // True Browser Fullscreen + Zen Mode integration
  const handleToggleZenMode = () => {
    if (!zenMode) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setZenMode(true);
      setActiveWidget(null);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setZenMode(false);
    }
  };

  // Sync fullscreen change with zen mode
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && zenMode) {
        setZenMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [zenMode]);

  // Keyboard shortcut: ESC to toggle zen mode / close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isAuthModalOpen) setIsAuthModalOpen(false);
        else if (activeWidget) setActiveWidget(null);
        else if (isSoundModalOpen) setIsSoundModalOpen(false);
        else if (isArtUploaderOpen) setIsArtUploaderOpen(false);
        else if (isMusicUploaderOpen) setIsMusicUploaderOpen(false);
        else if (isProfileOpen) setIsProfileOpen(false);
        else if (zenMode) handleToggleZenMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWidget, isSoundModalOpen, isArtUploaderOpen, isMusicUploaderOpen, isProfileOpen, isAuthModalOpen, zenMode]);

  // Tasks actions
  const handleAddTask = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleIncrementTaskPomodoro = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const next = t.completedSessions + 1;
        return {
          ...t,
          completedSessions: next,
          completed: next >= t.targetSessions ? true : t.completed
        };
      }
      return t;
    }));
  };

  const handleDecrementTaskPomodoro = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          completedSessions: Math.max(0, t.completedSessions - 1)
        };
      }
      return t;
    }));
  };

  const handleSetActiveTaskTitle = (title, targetSessions = null, rank = 'A') => {
    if (!title.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      category: 'Focus Directive',
      rank: rank || 'A',
      completedSessions: 0,
      targetSessions: targetSessions ? Number(targetSessions) : null,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
    setActiveTaskId(newTask.id);
  };

  const handleUpdateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleClearActiveTask = () => {
    setActiveTaskId(null);
  };

  // Brainstorm Cards actions
  const handleAddCard = (newCard) => {
    setBrainstormCards([newCard, ...brainstormCards]);
  };

  const handleDeleteCard = (id) => {
    setBrainstormCards(brainstormCards.filter(c => c.id !== id));
  };

  const handleTogglePinCard = (id) => {
    setBrainstormCards(brainstormCards.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  // Session complete handler - Records Real Focus Time, Daily Pomodoros & Calendar Streak
  const handleSessionComplete = (sessionData) => {
    const updated = [sessionData, ...sessionLogs].slice(0, 5);
    setSessionLogs(updated);

    // Record in Real Daily Calendar Stats Engine
    const statsKey = userId ? `whiteroom_u_${userId}_focus_stats` : 'whiteroom_focus_stats';
    const updatedStats = recordCompletedSession(sessionData.durationMinutes, focusStats, statsKey);
    setFocusStats({ ...updatedStats });

    // Update profile stats
    setProfile(prev => ({
      ...prev,
      totalFocusMinutes: (prev.totalFocusMinutes || 0) + sessionData.durationMinutes,
      sessionsCompleted: (prev.sessionsCompleted || 0) + 1
    }));
  };

  // Inline Reflection comment on sessions
  const handleUpdateSessionComment = (id, newComment, mood) => {
    const updated = sessionLogs.map(s => {
      if (s.id === id) {
        return {
          ...s,
          userComment: newComment,
          mood: mood || s.mood
        };
      }
      return s;
    });
    setSessionLogs(updated);
  };

  const handleDeleteSession = (id) => {
    setSessionLogs(sessionLogs.filter(s => s.id !== id));
  };

  const handleClearLogs = () => {
    setSessionLogs([]);
  };

  const toggleWidget = (widgetName) => {
    if (activeWidget === widgetName) {
      setActiveWidget(null);
    } else {
      setActiveWidget(widgetName);
      setZenMode(false);
    }
  };

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 flex flex-col justify-between selection:bg-amber-400/30 selection:text-amber-200">
      
      {/* Toast Notification for Auth & System Events */}
      {authToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-neutral-950/95 border border-emerald-400/50 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className={`w-2.5 h-2.5 rounded-full ${authToast.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-semibold">{authToast.message}</span>
          <button 
            onClick={() => setAuthToast(null)} 
            className="text-slate-400 hover:text-white ml-2 text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Fullscreen Anime Art or Animated MP4 Video Live Wallpaper */}
      {currentScene.isVideo ? (
        <video
          ref={bgVideoRef}
          key={currentScene.id}
          src={currentScene.videoUrl || currentScene.imageUrl}
          autoPlay
          loop
          playsInline
          muted={!currentScene.enableSound || isMuted}
          className="fixed inset-0 z-0 w-full h-full object-cover transition-opacity duration-1000 transform scale-100"
          style={{ filter: `brightness(${bgBrightness})` }}
        />
      ) : (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 transform scale-100"
          style={{
            backgroundImage: `url(${currentScene.imageUrl})`,
            filter: `brightness(${bgBrightness})`
          }}
        />
      )}

      {/* Video Wallpaper Playback Options (Play, Pause, Speed, Scrubbing, Sound, Dimmer) */}
      <BackgroundVideoControls
        videoRef={bgVideoRef}
        currentScene={currentScene}
        isMuted={isMuted}
        masterVolume={masterVolume}
        zenMode={zenMode}
        brightness={bgBrightness}
        onBrightnessChange={setBgBrightness}
      />

      {/* 2. Soft Ambient Film Overlay (subtler in Zen for wallpaper clarity) */}
      <div className={`fixed inset-0 z-0 transition-colors duration-1000 ${zenMode ? 'bg-black/15' : (currentScene.overlay || 'bg-black/35')}`} />

      {/* 3. Top Navigation Bar (COMPLETELY HIDDEN in Zen Mode) */}
      {!zenMode && (
        <Header
          scene={currentScene}
          zenMode={zenMode}
          onToggleZenMode={handleToggleZenMode}
          onOpenProfile={() => setIsProfileOpen(true)}
          profile={profile}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          focusStats={focusStats}
        />
      )}

      {/* 4. Center Stage: Aesthetic Pomodoro Timer (Supports Transparent or Glass mode) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto space-y-4">
        
        {/* Quote Monologue snippet (HIDDEN in Zen Mode) */}
        {!zenMode && !activeWidget && (
          <div className="w-full max-w-lg mx-auto text-center px-4 animate-in fade-in duration-300">
            <p className="font-serif italic text-xs sm:text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              "{currentScene.quote}"
            </p>
            <p className="text-[11px] font-sans text-amber-300/90 font-medium drop-shadow mt-1">
              — {currentScene.speaker}
            </p>
          </div>
        )}

        {/* The Pomodoro Timer Card (or transparent floating numbers) */}
        {!activeWidget && (
          <div className="w-full animate-in zoom-in-95 duration-200">
            <StudyWithMeTimer
              timerConfig={timerConfig}
              onUpdateTimerConfig={setTimerConfig}
              activeTask={activeTask}
              onSetActiveTaskTitle={handleSetActiveTaskTitle}
              onClearActiveTask={handleClearActiveTask}
              onUpdateActiveTask={(updates) => activeTask && handleUpdateTask(activeTask.id, updates)}
              onTaskPomodoroIncrement={handleIncrementTaskPomodoro}
              onTaskPomodoroDecrement={handleDecrementTaskPomodoro}
              onSessionComplete={handleSessionComplete}
              scene={currentScene}
            />
          </div>
        )}

        {/* Floating Active Widget Sheet */}
        {activeWidget && !zenMode && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
            {activeWidget === 'tasks' && (
              <TasksCurriculum
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onIncrementTaskPomodoro={handleIncrementTaskPomodoro}
                onDecrementTaskPomodoro={handleDecrementTaskPomodoro}
                activeTaskId={activeTaskId}
                onSetActiveTask={setActiveTaskId}
                scene={currentScene}
                onClose={() => setActiveWidget(null)}
              />
            )}

            {activeWidget === 'brainstorm' && (
              <BrainstormBoard
                cards={brainstormCards}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onTogglePinCard={handleTogglePinCard}
                scene={currentScene}
                onClose={() => setActiveWidget(null)}
              />
            )}

            {activeWidget === 'comments' && (
              <SessionLogsFeed
                logs={sessionLogs}
                onUpdateSessionComment={handleUpdateSessionComment}
                onDeleteSession={handleDeleteSession}
                onClearLogs={handleClearLogs}
                scene={currentScene}
                onClose={() => setActiveWidget(null)}
              />
            )}
          </div>
        )}

      </main>

      {/* 5. Bottom Dock (COMPLETELY HIDDEN in Zen Mode) */}
      {!zenMode && (
        <BottomDock
          scenes={allScenes}
          currentSceneId={sceneId}
          onSelectScene={setSceneId}
          activeWidget={activeWidget}
          onToggleWidget={toggleWidget}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isPlayingMusic={isPlayingMusic}
          onTogglePlayMusic={handleTogglePlayMusic}
          currentTrack={currentTrack}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          tasksCount={tasks.filter(t => !t.completed).length}
          thoughtsCount={brainstormCards.length}
          commentsCount={sessionLogs.length}
          onOpenSoundModal={() => setIsSoundModalOpen(true)}
          onOpenArtUploader={() => setIsArtUploaderOpen(true)}
          onOpenMusicUploader={() => setIsMusicUploaderOpen(true)}
          showVideoVisualizer={showVideoVisualizer}
          onToggleVideoVisualizer={() => setShowVideoVisualizer(!showVideoVisualizer)}
        />
      )}

      {/* Universal Media Element: Plays Audio Tracks & MP4 Video Sounds seamlessly */}
      <video
        ref={mediaPlayerRef}
        playsInline
        loop={true}
        onEnded={handleNextTrack}
        className={
          showVideoVisualizer && currentTrack?.isVideo && isPlayingMusic && !zenMode
            ? "fixed bottom-24 right-5 z-40 w-72 h-44 rounded-2xl border border-white/20 shadow-2xl object-cover bg-black animate-in fade-in zoom-in-95 duration-200"
            : "hidden"
        }
      />

      {/* Floating Mini Video Visualizer Header / Close Control (when video sound is playing) */}
      {showVideoVisualizer && currentTrack?.isVideo && isPlayingMusic && !zenMode && (
        <div className="fixed bottom-[280px] right-5 z-40 flex items-center justify-between w-72 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs text-white shadow-xl animate-in fade-in">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <Video className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-semibold truncate text-[11px]">{currentTrack.title}</span>
          </div>
          <button
            onClick={() => setShowVideoVisualizer(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Minimize to background sound"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Custom Multi-Channel MP4 & Audio Sound Loops (Mixed with procedural sounds) */}
      {customSoundLayers.map((sound) => (
        <CustomSoundLoopPlayer
          key={sound.id}
          sound={sound}
          isMuted={isMuted}
          masterVolume={masterVolume}
        />
      ))}

      {/* Zen Mode Exit button: Subtle pill appearing on hover or tap */}
      {zenMode && (
        <div className="fixed top-5 right-5 z-40 opacity-30 hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleZenMode}
            className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-xs font-sans text-slate-200 hover:text-white transition-all shadow-xl"
          >
            Exit Zen Mode (Esc)
          </button>
        </div>
      )}

      {/* 16 Natural Soundscapes + Custom MP4 Video Sounds Matrix Modal */}
      <SoundMixerModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        acoustics={acoustics}
        onAcousticChange={handleAcousticChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolumeChange}
        customSounds={customSoundLayers}
        onAddCustomSound={handleAddCustomSound}
        onUpdateCustomSoundVolume={handleUpdateCustomSoundVolume}
        onDeleteCustomSound={handleDeleteCustomSound}
      />

      {/* Custom Art & Animated Video Live Wallpaper Uploader Modal */}
      <ArtUploaderModal
        isOpen={isArtUploaderOpen}
        onClose={() => setIsArtUploaderOpen(false)}
        customScenes={customScenes}
        onAddCustomScene={handleAddCustomScene}
        onDeleteCustomScene={handleDeleteCustomScene}
        onSelectScene={setSceneId}
        currentSceneId={sceneId}
      />

      {/* Custom Music & MP4 Video Sounds Library Modal */}
      <MusicUploaderModal
        isOpen={isMusicUploaderOpen}
        onClose={() => setIsMusicUploaderOpen(false)}
        playlist={allTracks}
        onAddTrack={handleAddCustomTrack}
        onDeleteTrack={handleDeleteCustomTrack}
        currentTrackIdx={currentTrackIdx}
        onSelectTrack={handleSelectTrack}
        isPlaying={isPlayingMusic}
      />

      {/* Fully Customizable OAA Student Profile & Real Daily Performance Modal */}
      <OAAProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        focusStats={focusStats}
      />

      {/* Authentication Modal: Real Sign Up, Login, and Multi-user Data Access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentUser={currentUser}
      />

    </div>
  );
}
