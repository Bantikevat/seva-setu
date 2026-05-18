import { useNetworkSpeed } from '@/hooks/useNetworkSpeed';
import { Wifi } from 'lucide-react';

export const NetworkIndicator = () => {
  const { slow, effectiveType } = useNetworkSpeed();
  if (!slow) return null;
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[10000] bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-slide-down">
      <Wifi size={12} /> Slow connection ({effectiveType})
    </div>
  );
};
