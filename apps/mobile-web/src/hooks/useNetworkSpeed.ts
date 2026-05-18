import { useEffect, useState } from 'react';

type NetworkType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
interface NetworkInfo { effectiveType: NetworkType; saveData: boolean; slow: boolean; }

export const useNetworkSpeed = (): NetworkInfo => {
  const [info, setInfo] = useState<NetworkInfo>({ effectiveType: 'unknown', saveData: false, slow: false });

  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { effectiveType: NetworkType; saveData: boolean; addEventListener: (e: string, fn: () => void) => void } }).connection;
    if (!conn) return;

    const update = () => {
      const et = conn.effectiveType || 'unknown';
      setInfo({
        effectiveType: et,
        saveData:      !!conn.saveData,
        slow:          et === 'slow-2g' || et === '2g',
      });
    };
    update();
    conn.addEventListener('change', update);
  }, []);

  return info;
};
