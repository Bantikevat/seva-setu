/**
 * useTrackingBroadcast — Worker-side: broadcasts live location to a booking room
 *
 *   const { start, stop, status, error } = useTrackingBroadcast(bookingId);
 *
 *   Worker taps "Start sharing location" → start()
 *   Browser asks GPS permission → starts watchPosition
 *   Every position update is emitted via Socket.io as 'tracking:update'
 *   Customer's TrackingScreen receives it in real time.
 *
 * Use on Worker Dashboard for active bookings.
 */

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = ((import.meta as any).env?.VITE_BOOKING_API as string | undefined) || 'http://localhost:3004';

type Status = 'idle' | 'connecting' | 'sharing' | 'denied' | 'error';

interface UseTrackingBroadcastResult {
  start:  () => void;
  stop:   () => void;
  status: Status;
  error:  string | null;
  lastSent: { lat: number; lng: number; t: number } | null;
}

export const useTrackingBroadcast = (bookingId: string | null | undefined): UseTrackingBroadcastResult => {
  const [status, setStatus]   = useState<Status>('idle');
  const [error, setError]     = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<{ lat: number; lng: number; t: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const watchRef  = useRef<number | null>(null);

  const stop = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('idle');
  };

  const start = () => {
    if (!bookingId) return;
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }
    const token = localStorage.getItem('seva_token');
    if (!token) { setStatus('error'); setError('Not logged in'); return; }

    setStatus('connecting');
    setError(null);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('chat:join', { bookingId });
      // Start GPS watch
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setStatus('sharing');
          const { latitude, longitude } = pos.coords;
          socket.emit('tracking:update', { bookingId, latitude, longitude });
          setLastSent({ lat: latitude, lng: longitude, t: Date.now() });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setStatus('denied');
          else { setStatus('error'); setError(err.message); }
          stop();
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    });

    socket.on('tracking:error', (e) => { setError(e.message || e.code); setStatus('error'); });
    socket.on('disconnect', () => { if (status === 'sharing') setStatus('idle'); });
  };

  // Cleanup on unmount
  useEffect(() => () => stop(), []);

  return { start, stop, status, error, lastSent };
};
