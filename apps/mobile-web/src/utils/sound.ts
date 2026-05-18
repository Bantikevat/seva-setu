/**
 * Sound effects via Web Audio API — no asset files, zero bytes.
 * Generates tones procedurally.
 */
let ctx: AudioContext | null = null;
let muted = localStorage.getItem('seva_sound_muted') === '1';

const getCtx = (): AudioContext | null => {
  if (muted) return null;
  if (!ctx) {
    try {
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      ctx = new Ctor();
    } catch { return null; }
  }
  return ctx;
};

const tone = (freq: number, durationMs: number, type: OscillatorType = 'sine', vol = 0.15) => {
  const c = getCtx();
  if (!c) return;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durationMs / 1000);
  osc.connect(gain); gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durationMs / 1000);
};

export const sound = {
  tap:     () => tone(800, 50, 'sine', 0.05),
  success: () => { tone(523, 100); setTimeout(() => tone(784, 150), 80); },
  error:   () => { tone(300, 100, 'square'); setTimeout(() => tone(200, 150, 'square'), 80); },
  ding:    () => tone(1200, 200, 'sine', 0.1),
  setMuted: (m: boolean) => { muted = m; localStorage.setItem('seva_sound_muted', m ? '1' : '0'); },
  isMuted:  () => muted,
};
