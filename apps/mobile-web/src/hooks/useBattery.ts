import { useEffect, useState } from 'react';

interface BatteryState { level: number; charging: boolean; low: boolean; }

export const useBattery = (): BatteryState => {
  const [state, setState] = useState<BatteryState>({ level: 1, charging: true, low: false });

  useEffect(() => {
    const getBat = (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean; addEventListener: (e: string, fn: () => void) => void }> }).getBattery;
    if (!getBat) return;
    let battery: Awaited<ReturnType<typeof getBat>> | null = null;

    const update = () => {
      if (!battery) return;
      setState({
        level:    battery.level,
        charging: battery.charging,
        low:      battery.level < 0.2 && !battery.charging,
      });
    };

    getBat().then((b) => {
      battery = b;
      update();
      b.addEventListener('levelchange',    update);
      b.addEventListener('chargingchange', update);
    });
  }, []);

  return state;
};
