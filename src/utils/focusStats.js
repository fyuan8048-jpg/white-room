// Engine for tracking real daily focus time, daily pomodoros, and calendar streaks

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadDailyStats(storageKey = 'whiteroom_focus_stats') {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return getEmptyStats();
    }
    const data = JSON.parse(raw);
    return data || getEmptyStats();
  } catch (e) {
    return getEmptyStats();
  }
}

export function saveDailyStats(stats, storageKey = 'whiteroom_focus_stats') {
  try {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save daily focus stats', e);
  }
}

export function getEmptyStats() {
  return {
    dailyRecords: {}, // { '2026-09-26': { focusMinutes: 50, pomodoroCount: 2, sessions: [] } }
    totalFocusMinutes: 0,
    totalSessions: 0,
    longestStreak: 0
  };
}

// Record a completed focus session
export function recordCompletedSession(durationMinutes, currentStats = null, storageKey = 'whiteroom_focus_stats') {
  const stats = currentStats || loadDailyStats(storageKey);
  const todayStr = getLocalDateString();

  if (!stats.dailyRecords) {
    stats.dailyRecords = {};
  }

  if (!stats.dailyRecords[todayStr]) {
    stats.dailyRecords[todayStr] = {
      date: todayStr,
      focusMinutes: 0,
      pomodoroCount: 0,
      sessions: []
    };
  }

  const record = stats.dailyRecords[todayStr];
  record.focusMinutes += durationMinutes;
  record.pomodoroCount += 1;
  record.sessions.push({
    timestamp: new Date().toISOString(),
    durationMinutes
  });

  stats.totalFocusMinutes = (stats.totalFocusMinutes || 0) + durationMinutes;
  stats.totalSessions = (stats.totalSessions || 0) + 1;

  // Recalculate streak
  const currentStreak = calculateCurrentStreak(stats.dailyRecords);
  if (currentStreak > (stats.longestStreak || 0)) {
    stats.longestStreak = currentStreak;
  }

  saveDailyStats(stats, storageKey);
  return stats;
}

// Real calendar streak calculation
export function calculateCurrentStreak(dailyRecords = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = getLocalDateString(today);
  const hasTodayActivity = (dailyRecords[todayStr]?.pomodoroCount || 0) > 0;

  // Determine starting point
  let checkDate = new Date(today);
  let streak = 0;

  if (hasTodayActivity) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If no activity today, check if yesterday was active
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(checkDate);
    if ((dailyRecords[yesterdayStr]?.pomodoroCount || 0) > 0) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return 0; // Streak broken
    }
  }

  // Count backwards consecutively
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    const dayRecord = dailyRecords[dateStr];
    if (dayRecord && (dayRecord.pomodoroCount > 0 || dayRecord.focusMinutes > 0)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Get the last 7 calendar days breakdown
export function getLast7DaysHistory(dailyRecords = {}) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = getLocalDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const record = dailyRecords[dateStr] || { focusMinutes: 0, pomodoroCount: 0 };

    days.push({
      dateStr,
      dayLabel: dayNames[d.getDay()],
      focusMinutes: record.focusMinutes || 0,
      pomodoros: record.pomodoroCount || 0,
      isToday: dateStr === todayStr
    });
  }

  return days;
}

// Get comprehensive summary stats for today and all time
export function getFocusSummary(stats = null) {
  const s = stats || loadDailyStats();
  const todayStr = getLocalDateString();
  const todayRecord = s.dailyRecords?.[todayStr] || { focusMinutes: 0, pomodoroCount: 0 };
  const currentStreak = calculateCurrentStreak(s.dailyRecords);

  return {
    todayFocusMinutes: todayRecord.focusMinutes || 0,
    todayPomodoros: todayRecord.pomodoroCount || 0,
    totalFocusMinutes: s.totalFocusMinutes || 0,
    totalSessions: s.totalSessions || 0,
    currentStreak: currentStreak,
    longestStreak: Math.max(currentStreak, s.longestStreak || 0),
    last7Days: getLast7DaysHistory(s.dailyRecords)
  };
}
