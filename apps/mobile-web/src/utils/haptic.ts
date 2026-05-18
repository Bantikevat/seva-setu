/**
 * Haptic feedback — vibration on supported devices (Android/Chrome).
 * iOS Safari doesn't support but degrades silently.
 */
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
};

export const haptic = {
  light:   () => vibrate(10),
  medium:  () => vibrate(20),
  heavy:   () => vibrate(40),
  success: () => vibrate([10, 30, 30]),
  error:   () => vibrate([50, 50, 50]),
  warning: () => vibrate([30, 30, 30]),
};
