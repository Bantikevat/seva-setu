/**
 * Wake Lock — keep screen on (useful during live tracking)
 */
type WakeLockSentinel = { release: () => Promise<void> };
let sentinel: WakeLockSentinel | null = null;

export const requestWakeLock = async (): Promise<boolean> => {
  try {
    const wl = (navigator as unknown as { wakeLock?: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock;
    if (!wl) return false;
    sentinel = await wl.request('screen');
    return true;
  } catch { return false; }
};

export const releaseWakeLock = async () => {
  try { await sentinel?.release(); sentinel = null; } catch {}
};

export const useWakeLockOnMount = (active = true) => {
  // Inline hook usage via useEffect in component:
  // useEffect(() => { if (active) requestWakeLock(); return () => { releaseWakeLock(); }; }, [active]);
  return { requestWakeLock, releaseWakeLock };
};
