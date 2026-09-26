// LocalStorage data persistence with clean slate (no dummy data)

export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(`whiteroom_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(`whiteroom_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const getInitialData = () => {
  // Check if we need to purge legacy dummy tasks
  const hasMigrated = localStorage.getItem('whiteroom_clean_slate_v2');
  if (!hasMigrated) {
    localStorage.removeItem('whiteroom_tasks');
    localStorage.removeItem('whiteroom_cards');
    localStorage.removeItem('whiteroom_logs');
    localStorage.removeItem('whiteroom_monologue');
    localStorage.setItem('whiteroom_clean_slate_v2', 'true');
  }

  return {
    tasks: loadFromStorage('tasks', []),
    brainstormCards: loadFromStorage('cards', []),
    sessionLogs: loadFromStorage('session_logs', []).slice(0, 5),
    profile: loadFromStorage('profile', {
      studentName: 'Ayanokoji Kiyotaka',
      studentId: 'WR-GEN4-401',
      generation: '4th Generation Curriculum',
      status: 'Masterpiece',
      classRank: 'Rank S',
      totalFocusMinutes: 0,
      streakDays: 1,
      sessionsCompleted: 0,
      oaa: {
        academic: 90,
        adaptability: 90,
        physical: 90,
        social: 80,
        overall: 'A'
      }
    }),
    timerConfig: loadFromStorage('timer_config', {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      longBreakInterval: 4,
    })
  };
};
