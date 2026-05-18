/**
 * Sleep mode — 10pm to 7am, suppress non-critical notifications.
 */
const SLEEP_START = 22;  // 10 PM
const SLEEP_END   = 7;   // 7 AM

export const isSleepMode = (): boolean => {
  if (localStorage.getItem('seva_sleep_mode_disabled') === '1') return false;
  const hour = new Date().getHours();
  return hour >= SLEEP_START || hour < SLEEP_END;
};

export const shouldNotify = (priority: 'high' | 'normal' = 'normal'): boolean => {
  if (priority === 'high') return true;       // urgent always
  return !isSleepMode();
};

export const toggleSleepMode = (enabled: boolean) => {
  localStorage.setItem('seva_sleep_mode_disabled', enabled ? '0' : '1');
};
