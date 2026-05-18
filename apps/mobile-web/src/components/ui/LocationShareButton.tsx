/**
 * LocationShareButton — Worker-side toggle to broadcast GPS location
 *
 * Drop into any worker view with an active booking id.
 * Customer's TrackingScreen will receive the pings live.
 */

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Radio, CircleSlash, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTrackingBroadcast } from '@/hooks/useTrackingBroadcast';

interface Props {
  bookingId: string;
  className?: string;
}

export const LocationShareButton = ({ bookingId, className = '' }: Props) => {
  const { start, stop, status, error, lastSent } = useTrackingBroadcast(bookingId);

  useEffect(() => {
    if (status === 'denied') toast.error('Location permission denied. Allow GPS in browser settings.');
    if (status === 'error' && error) toast.error(error);
  }, [status, error]);

  const isOn = status === 'sharing' || status === 'connecting';

  const handleClick = () => {
    if (isOn) {
      stop();
      toast.success('Stopped sharing location');
    } else {
      start();
      toast.success('Sharing live location...');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition ${
        status === 'sharing'    ? 'bg-red-500 text-white' :
        status === 'connecting' ? 'bg-amber-500 text-white' :
        status === 'denied'     ? 'bg-ink-200 text-ink-500' :
        'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900'
      } ${className}`}
      title={lastSent ? `Last sent: ${new Date(lastSent.t).toLocaleTimeString()}` : 'Share live location'}
    >
      {status === 'sharing' ? (
        <>
          <Radio size={12} className="animate-pulse" />
          <span>Sharing location · LIVE</span>
        </>
      ) : status === 'connecting' ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span>Connecting...</span>
        </>
      ) : status === 'denied' ? (
        <>
          <CircleSlash size={12} />
          <span>GPS blocked</span>
        </>
      ) : (
        <>
          <MapPin size={12} />
          <span>Share live location</span>
        </>
      )}
    </motion.button>
  );
};
