/**
 * LIVE TRACKING SCREEN
 * -------------------------------------------------
 * Real-time worker location via Socket.io + map.
 * Falls back to status-based progress if no live signal yet.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, MapPin, Share2 } from 'lucide-react';
import { booking as bookingApi } from '@/services/api';
import { LeafletMap } from '@/components/ui/LeafletMap';
import { whatsAppShare, shareNative } from '@/utils/free-features';
import { useTracking } from '@/hooks/useTracking';
import type { Booking } from '@/types';
import { logger } from '@/utils/logger';
import { requestWakeLock, releaseWakeLock } from '@/utils/wake-lock';

const STATUS_MESSAGES: Record<string, { msg: string; emoji: string; eta: string }> = {
  pending:     { msg: 'Worker assignment ho raha hai',    emoji: 'â³', eta: 'ETA: 2 min' },
  confirmed:   { msg: 'Worker confirmed! Coming soon',     emoji: 'âœ…', eta: 'ETA: 25 min' },
  on_the_way:  { msg: 'Worker is on the way to you',       emoji: 'ðŸš—', eta: 'ETA: 15 min' },
  in_progress: { msg: 'Worker has arrived. Working now',   emoji: 'ðŸ› ï¸', eta: 'IN PROGRESS' },
  completed:   { msg: 'Job completed! Please rate',        emoji: 'âœ¨', eta: 'DONE' },
  cancelled:   { msg: 'Booking cancelled',                  emoji: 'âŒ', eta: 'CANCELLED' },
};

// Haversine distance in km
const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const TrackingScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { location: liveLoc, isLive, isConnected } = useTracking(id);

  const load = async () => {
    try {
      const res = await bookingApi.getById(id!);
      if (res.data) setBookingData(res.data);
    } catch (err) {
      logger.error(err);
    }
  };

  useEffect(() => {
    load();
    // Poll booking status every 5s (status changes, not GPS)
    intervalRef.current = setInterval(load, 5000);
    // Keep screen on during tracking
    requestWakeLock();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, [id]);

  if (!bookingData) {
    return (
      <div className="w-full h-full bg-cream-50 dark:bg-ink-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusInfo = STATUS_MESSAGES[bookingData.status] || STATUS_MESSAGES.pending;
  const customerLat = bookingData.latitude ?? 23.1765;
  const customerLng = bookingData.longitude ?? 75.7885;

  // Worker coords â€” prefer live, fallback to status-based animated approach
  let workerLat: number | undefined;
  let workerLng: number | undefined;
  let distanceKm: number | null = null;
  let etaMin: number | null = null;

  if (liveLoc) {
    workerLat = liveLoc.latitude;
    workerLng = liveLoc.longitude;
    distanceKm = haversine(customerLat, customerLng, workerLat, workerLng);
    // Average urban speed 25 km/h â†’ minutes
    etaMin = distanceKm > 0.1 ? Math.max(1, Math.round((distanceKm / 25) * 60)) : 0;
  } else if (['confirmed', 'on_the_way', 'in_progress'].includes(bookingData.status)) {
    const progress = bookingData.status === 'confirmed' ? 0.25 :
                     bookingData.status === 'on_the_way' ? 0.6 :
                     0.95;
    workerLat = customerLat + 0.01 * (1 - progress);
    workerLng = customerLng - 0.005 * (1 - progress);
  }

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-hidden relative">
      {/* MAP */}
      <div className="relative h-[55%] overflow-hidden">
        <LeafletMap
          customerLat={customerLat}
          customerLng={customerLng}
          workerLat={workerLat}
          workerLng={workerLng}
          workerName={bookingData.workerName.split(' ')[0]}
          categoryEmoji={bookingData.categoryEmoji}
          height="100%"
        />

        {/* Back */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/booking/${id}`)}
          className="absolute top-12 left-4 w-10 h-10 bg-white dark:bg-ink-800 rounded-2xl shadow-lg flex items-center justify-center z-[1000]"
        >
          <ArrowLeft size={18} className="text-ink-700 dark:text-cream-100" />
        </motion.button>

        {/* Share */}
        <button
          onClick={() => shareNative({
            title: 'Live Tracking',
            text: `Track my ${bookingData.categoryName} service â€” ${bookingData.bookingNumber}`,
            url: window.location.href,
          })}
          className="absolute top-12 right-20 w-10 h-10 bg-white dark:bg-ink-800 rounded-2xl shadow-lg flex items-center justify-center z-[1000]"
        >
          <Share2 size={16} className="text-ink-700 dark:text-cream-100" />
        </button>

        {/* Live indicator */}
        <div className="absolute top-12 right-4 bg-white dark:bg-ink-800 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-[1000]">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : isConnected ? 'bg-amber-500' : 'bg-ink-300'}`} />
          <span className="text-[10px] font-medium tracking-wider uppercase text-ink-900 dark:text-cream-100">
            {isLive ? 'Live' : isConnected ? 'Waiting' : 'Offline'}
          </span>
        </div>
      </div>

      {/* INFO PANEL */}
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 inset-x-0 bg-white dark:bg-ink-800 rounded-t-3xl shadow-2xl p-5 z-20 max-h-[55%] overflow-y-auto"
      >
        <div className="w-12 h-1 bg-ink-200 dark:bg-ink-600 rounded-full mx-auto mb-4" />

        {/* Editorial status */}
        <div className="mb-5">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-2">Status</p>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50 leading-tight">
              {statusInfo.msg}
            </h2>
            <span className="text-2xl">{statusInfo.emoji}</span>
          </div>
          <p className="text-sm font-medium text-primary-500 mt-1">{statusInfo.eta}</p>
        </div>

        {/* Live distance / ETA card */}
        {isLive && distanceKm !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-ink-900 dark:bg-ink-950 text-cream-50 rounded-2xl p-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/15 rounded-full blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-1">Distance</p>
                <p className="font-display text-2xl tracking-tight font-medium">
                  {distanceKm < 0.1 ? '~ Here' : `${distanceKm.toFixed(distanceKm < 1 ? 2 : 1)} km`}
                </p>
              </div>
              <div className="border-l border-cream-100/10 pl-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-1">ETA</p>
                <p className="font-display text-2xl tracking-tight font-medium">
                  {etaMin === 0 ? 'Arriving' : `${etaMin} min`}
                </p>
              </div>
            </div>
            {liveLoc?.timestamp && (
              <p className="text-[10px] text-cream-100/40 font-mono mt-2">
                Last update: {new Date(liveLoc.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </motion.div>
        )}

        {/* Worker card */}
        <div className="border-t border-ink-100 dark:border-ink-700 pt-4 mb-3">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">Worker</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cream-100 dark:bg-ink-700 rounded-2xl flex items-center justify-center text-xl">
              {bookingData.categoryEmoji || 'ðŸ‘¤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-ink-900 dark:text-cream-50 truncate">{bookingData.workerName}</p>
              <p className="text-xs text-ink-400">{bookingData.categoryName}</p>
            </div>
            <a
              href={`tel:${bookingData.workerPhone}`}
              className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center"
              aria-label="Call worker"
            >
              <Phone size={16} />
            </a>
            <button
              onClick={() => navigate(`/chat/${id}`)}
              className="w-10 h-10 bg-primary-50 dark:bg-primary-500/20 text-primary-600 rounded-2xl flex items-center justify-center"
              aria-label="Chat"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="border-t border-ink-100 dark:border-ink-700 pt-3 flex items-start gap-2">
          <MapPin size={14} className="text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink-700 dark:text-cream-100 flex-1 leading-relaxed">
            {bookingData.fullAddress}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
          <span className="text-ink-400 font-mono">{bookingData.bookingNumber}</span>
          <span className="font-medium text-primary-500 font-display text-base">â‚¹{bookingData.totalAmount}</span>
        </div>
      </motion.div>
    </div>
  );
};
