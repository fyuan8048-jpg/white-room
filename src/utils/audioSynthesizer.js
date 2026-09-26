// High-fidelity Procedural Natural Soundscapes & Focus Audio Suite
// Comprehensive natural acoustic generators: Ocean Waves, Campfire, Forest Wind, Stream, Crickets, Birds, Rain, Brown Noise, Vinyl, Keyboard

class NaturalAudioSuite {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.channels = {
      brownNoise: { node: null, gain: null, volume: 0 },
      oceanWaves: { node: null, gain: null, lfo: null, volume: 0 },
      campfire: { node: null, gain: null, interval: null, volume: 0 },
      forestRain: { node: null, gain: null, volume: 0 },
      thunderstorm: { node: null, gain: null, interval: null, volume: 0 },
      forestWind: { node: null, gain: null, volume: 0 },
      waterStream: { node: null, gain: null, volume: 0 },
      nightCrickets: { node: null, gain: null, interval: null, volume: 0 },
      morningBirds: { interval: null, gain: null, volume: 0 },
      keyboardTyping: { interval: null, gain: null, volume: 0 },
      vinylCrackle: { node: null, gain: null, volume: 0 },
      cafeAmbience: { node: null, gain: null, volume: 0 },
      pinkNoise: { node: null, gain: null, volume: 0 },
      whiteNoise: { node: null, gain: null, volume: 0 },
      clockTick: { interval: null, gain: null, volume: 0 },
      jazzRhodes: { interval: null, gain: null, volume: 0 },
    };
    this.initialized = false;
    this.chimeEnabled = true;
  }

  init() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Warm Tibetan singing bowl session bell
  playSessionChime() {
    if (!this.chimeEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chimeGain = this.ctx.createGain();
    chimeGain.connect(this.masterGain);

    const harmonics = [196, 293.66, 392, 493.88];
    harmonics.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5 + idx * 0.5);

      osc.connect(gain);
      gain.connect(chimeGain);
      osc.start(now);
      osc.stop(now + 5.5);
    });
  }

  setVolume(track, volume) {
    this.ensureContext();
    if (!this.channels[track]) return;
    this.channels[track].volume = volume;

    if (volume > 0) {
      this.startTrack(track);
    } else {
      this.stopTrack(track);
    }
  }

  setMasterVolume(val) {
    this.ensureContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  startTrack(track) {
    if (!this.ctx) return;
    const ch = this.channels[track];

    // 1. DEEP BROWN NOISE
    if (track === 'brownNoise') {
      if (!ch.node) {
        const bufferSize = 4 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          output[i] = lastOut * 3.8;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.8, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.8, this.ctx.currentTime);
      }
    }

    // 2. OCEAN WAVES (Rhythmic modulated swells)
    if (track === 'oceanWaves') {
      if (!ch.node) {
        const bufferSize = 4 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        const left = noiseBuffer.getChannelData(0);
        const right = noiseBuffer.getChannelData(1);
        let lastL = 0, lastR = 0;

        for (let i = 0; i < bufferSize; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;
          lastL = (lastL + 0.025 * whiteL) / 1.02;
          lastR = (lastR + 0.025 * whiteR) / 1.02;
          left[i] = lastL * 3.2;
          right[i] = lastR * 3.2;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        // Modulated bandpass filter simulating wave crests
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12s per wave

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.75, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        lfo.start(0);

        ch.node = source;
        ch.lfo = lfo;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.75, this.ctx.currentTime);
      }
    }

    // 3. CAMPFIRE & FIREPLACE (Warm wood snaps, crackles and gentle flame)
    if (track === 'campfire') {
      if (!ch.node) {
        // Base flame hiss
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.08;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.5, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start(0);

        // Crackle generator interval
        const interval = setInterval(() => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          if (Math.random() < 0.45) {
            const now = this.ctx.currentTime;
            const pop = this.ctx.createBufferSource();
            const popBuffer = this.ctx.createBuffer(1, 0.05 * this.ctx.sampleRate, this.ctx.sampleRate);
            const popData = popBuffer.getChannelData(0);
            for (let j = 0; j < popData.length; j++) {
              popData[j] = (Math.random() * 2 - 1) * Math.exp(-j / 250);
            }
            pop.buffer = popBuffer;

            const popFilter = this.ctx.createBiquadFilter();
            popFilter.type = 'bandpass';
            popFilter.frequency.setValueAtTime(1200 + Math.random() * 1500, now);

            const popGain = this.ctx.createGain();
            popGain.gain.setValueAtTime(ch.volume * (0.3 + Math.random() * 0.4), now);

            pop.connect(popFilter);
            popFilter.connect(popGain);
            popGain.connect(this.masterGain);

            pop.start(now);
          }
        }, 120);

        ch.node = source;
        ch.interval = interval;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.5, this.ctx.currentTime);
      }
    }

    // 4. FOREST RAIN & RAIN ON LEAVES
    if (track === 'forestRain') {
      if (!ch.node) {
        const bufferSize = 4 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        const left = noiseBuffer.getChannelData(0);
        const right = noiseBuffer.getChannelData(1);

        for (let i = 0; i < bufferSize; i++) {
          left[i] = (Math.random() * 2 - 1) * 0.18;
          right[i] = (Math.random() * 2 - 1) * 0.18;
          if (Math.random() < 0.002) left[i] += Math.random() * 0.6;
          if (Math.random() < 0.002) right[i] += Math.random() * 0.6;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.7, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.7, this.ctx.currentTime);
      }
    }

    // 5. THUNDERSTORM (Deep rumble bass swells)
    if (track === 'thunderstorm') {
      if (!ch.interval) {
        const triggerThunder = () => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const dur = 4.5 + Math.random() * 3;
          const thunderBuffer = this.ctx.createBuffer(1, dur * this.ctx.sampleRate, this.ctx.sampleRate);
          const data = thunderBuffer.getChannelData(0);
          let val = 0;
          for (let i = 0; i < data.length; i++) {
            val = (val + (Math.random() * 2 - 1) * 0.1) / 1.05;
            data[i] = val * (1 - i / data.length);
          }

          const src = this.ctx.createBufferSource();
          src.buffer = thunderBuffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(90, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(ch.volume * 0.9, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          src.start(now);
        };

        triggerThunder();
        ch.interval = setInterval(() => {
          if (Math.random() < 0.35) triggerThunder();
        }, 12000);
      }
    }

    // 6. FOREST WIND (Gentle breeze rustling)
    if (track === 'forestWind') {
      if (!ch.node) {
        const bufferSize = 4 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b = 0;
        for (let i = 0; i < bufferSize; i++) {
          b = 0.96 * b + (Math.random() * 2 - 1) * 0.05;
          output[i] = b;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        // Modulate breeze
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.65, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        lfo.start(0);

        ch.node = source;
        ch.lfo = lfo;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.65, this.ctx.currentTime);
      }
    }

    // 7. WATER STREAM / MOUNTAIN BROOK
    if (track === 'waterStream') {
      if (!ch.node) {
        const bufferSize = 3 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(650, this.ctx.currentTime);
        filter1.Q.setValueAtTime(2.0, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.6, this.ctx.currentTime);

        source.connect(filter1);
        filter1.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.6, this.ctx.currentTime);
      }
    }

    // 8. NIGHT CRICKETS & CICADAS (Summer evening solitude)
    if (track === 'nightCrickets') {
      if (!ch.interval) {
        const chirpCricket = () => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(4600, now);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(4750, now);

          // Fast 16Hz chirp envelope
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(ch.volume * 0.15, now + 0.05);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          gain.gain.linearRampToValueAtTime(ch.volume * 0.15, now + 0.25);
          gain.gain.linearRampToValueAtTime(0, now + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.45);
          osc2.stop(now + 0.45);
        };

        chirpCricket();
        ch.interval = setInterval(chirpCricket, 1800);
      }
    }

    // 9. MORNING BIRDS IN FOREST
    if (track === 'morningBirds') {
      if (!ch.interval) {
        const chirpBird = () => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2800 + Math.random() * 1200;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 800, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.2);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(ch.volume * 0.12, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.28);
        };

        ch.interval = setInterval(() => {
          if (Math.random() < 0.4) chirpBird();
        }, 3200);
      }
    }

    // 10. SOFT MECHANICAL KEYBOARD TYPING
    if (track === 'keyboardTyping') {
      if (!ch.interval) {
        const typeKey = () => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

          gain.gain.setValueAtTime(ch.volume * 0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.04);
        };

        ch.interval = setInterval(() => {
          if (Math.random() < 0.75) typeKey();
        }, 180);
      }
    }

    // 11. VINYL TURNTABLE CRACKLE
    if (track === 'vinylCrackle') {
      if (!ch.node) {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          let sample = (Math.random() * 2 - 1) * 0.015;
          if (Math.random() < 0.0015) sample = (Math.random() * 2 - 1) * 0.4;
          output[i] = sample;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.5, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.5, this.ctx.currentTime);
      }
    }

    // 12. CAFE AMBIENCE
    if (track === 'cafeAmbience') {
      if (!ch.node) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(180, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, this.ctx.currentTime);

        gain.gain.setValueAtTime(ch.volume * 0.35, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start();
        osc2.start();

        ch.node = { osc1, osc2 };
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.35, this.ctx.currentTime);
      }
    }

    // 13. VELVET PINK NOISE
    if (track === 'pinkNoise') {
      if (!ch.node) {
        const bufferSize = 4 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.6, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.6, this.ctx.currentTime);
      }
    }

    // 14. GENTLE WHITE NOISE
    if (track === 'whiteNoise') {
      if (!ch.node) {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3500, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(ch.volume * 0.4, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        ch.node = source;
        ch.gain = gain;
      } else {
        ch.gain.gain.setValueAtTime(ch.volume * 0.4, this.ctx.currentTime);
      }
    }

    // 15. CLOCK METRONOME
    if (track === 'clockTick') {
      if (!ch.interval) {
        ch.interval = setInterval(() => {
          if (ch.volume <= 0 || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
          gain.gain.setValueAtTime(ch.volume * 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.02);
        }, 1000);
      }
    }

    // 16. JAZZ RHODES CHORDS
    if (track === 'jazzRhodes') {
      if (!ch.interval) {
        ch.activeOscs = [];
        const chords = [
          [220, 261.63, 329.63, 392],       // Am7
          [174.61, 220, 261.63, 329.63],    // Fmaj7
          [196, 246.94, 293.66, 349.23],    // G7
          [130.81, 164.81, 196, 246.94],    // Cmaj7
          [146.83, 174.61, 220, 261.63],    // Dm7
          [164.81, 196, 246.94, 293.66]     // Em7
        ];
        let chordIdx = 0;

        const playChord = () => {
          if (!this.ctx || ch.volume <= 0 || this.isMuted) return;
          const currentChord = chords[chordIdx % chords.length];
          chordIdx++;
          const now = this.ctx.currentTime;
          ch.activeOscs = [];

          currentChord.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.04);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime((ch.volume * 0.12) / (i + 1), now + i * 0.04 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + i * 0.04);
            osc.stop(now + 5.2);
            ch.activeOscs.push(osc);
          });
        };

        playChord();
        ch.interval = setInterval(playChord, 5000);
      }
    }
  }

  stopTrack(track) {
    const ch = this.channels[track];
    if (!ch) return;

    if (track === 'jazzRhodes') {
      if (ch.interval) {
        clearInterval(ch.interval);
        ch.interval = null;
      }
      if (ch.activeOscs) {
        ch.activeOscs.forEach(o => {
          try { o.stop(); } catch (e) {}
        });
        ch.activeOscs = [];
      }
      return;
    }

    if (['campfire', 'thunderstorm', 'nightCrickets', 'morningBirds', 'keyboardTyping', 'clockTick', 'jazzRhodes'].includes(track)) {
      if (ch.interval) {
        clearInterval(ch.interval);
        ch.interval = null;
      }
      if (track !== 'campfire') return;
    }

    if (ch.lfo) {
      try { ch.lfo.stop(); } catch (e) {}
      ch.lfo = null;
    }

    if (ch.node) {
      try {
        if (ch.node.stop) ch.node.stop();
        else if (ch.node.osc1) {
          ch.node.osc1.stop();
          ch.node.osc2.stop();
        }
      } catch (e) {}
      ch.node = null;
      ch.gain = null;
    }
  }

  stopAll() {
    Object.keys(this.channels).forEach(track => {
      this.channels[track].volume = 0;
      this.stopTrack(track);
    });
  }
}

export const naturalAudioSuite = new NaturalAudioSuite();
export const focusAudioSuite = naturalAudioSuite;
