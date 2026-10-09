// Dynamic Ambient Day/Night & Weather Color Grading Engine

export function getTimeOfDay(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

export const DAY_NIGHT_PROFILES = {
  dawn: {
    name: 'Dawn Golden Glow',
    timeRange: '05:00 - 09:00',
    overlayClass: 'bg-gradient-to-t from-amber-950/30 via-orange-950/15 to-transparent',
    colorFilter: 'sepia(0.12) saturate(1.08) brightness(0.96)',
    accentDot: '#f59e0b'
  },
  day: {
    name: 'Clear Midday Clarity',
    timeRange: '09:00 - 18:00',
    overlayClass: 'bg-black/20',
    colorFilter: 'saturate(1.05) brightness(1.0)',
    accentDot: '#38bdf8'
  },
  dusk: {
    name: 'Violet Sunset Twilight',
    timeRange: '18:00 - 21:00',
    overlayClass: 'bg-gradient-to-t from-purple-950/40 via-amber-950/25 to-black/30',
    colorFilter: 'hue-rotate(-8deg) saturate(1.15) brightness(0.92)',
    accentDot: '#ec4899'
  },
  night: {
    name: 'Midnight Deep Indigo',
    timeRange: '21:00 - 05:00',
    overlayClass: 'bg-gradient-to-b from-blue-950/40 via-black/45 to-black/60',
    colorFilter: 'contrast(1.08) brightness(0.85) saturate(0.95)',
    accentDot: '#6366f1'
  }
};

export const WEATHER_PROFILES = {
  clear: {
    name: 'Clear Sky',
    extraFilter: '',
    particleOverlay: null
  },
  rain: {
    name: 'Rainy Atmosphere',
    extraFilter: 'hue-rotate(5deg) contrast(1.05)',
    particleOverlay: 'radial-gradient(ellipse at 50% 50%, rgba(30, 58, 138, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)'
  },
  mist: {
    name: 'Mountain Mist',
    extraFilter: 'blur(0.2px) brightness(1.02)',
    particleOverlay: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)'
  }
};
