/**
 * useTracking — Real-time worker location for a booking
 *
 *   const { location, trail, isLive } = useTracking(bookingId);
 *
 * On mount:
 *   1. Connects to booking-service WebSocket
 *   2. Joins the booking room (auth-checked)
 *   3. Fetches initial latest location via REST
 *   4. Subscribes to `tracking:location` events for live updates
 *
 * Returns the most recent { latitude, longitude, timestamp } + connection state.
 */

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { tracking as trackingApi } from '@/services/api';

const SOCKET_URL = ((import.meta as any).env?.VITE_BOOKING_API as string | undefined) || 'http://localhost:3004';

export interface LiveLocation {
  latitude:  number;
  longitude: number;
  timestamp: string;
  source?:   'live' | 'static';
}

export interface UseTrackingResult {
  location: LiveLocation | null;
  trail:    { lat: number; lng: number; t: string }[];
  isLive:   boolean;
  isConnected: boolean;
}

export const useTracking = (bookingId: string | null | undefined): UseTrackingResult => {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [trail, setTrail]       = useState<{ lat: number; lng: number; t: string }[]>([]);
  const [isLive, setIsLive]     = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initial REST fetch
  useEffect(() => {
    if (!bookingId) return;
    trackingApi.latest(bookingId).then((r) => { if (r.data) setLocation(r.data); }).catch(() => {});
    trackingApi.trail(bookingId).then((r) => { if (r.data?.points) setTrail(r.data.points); }).catch(() => {});
  }, [bookingId]);

  // Socket subscription
  useEffect(() => {
    if (!bookingId) return;
    const token = localStorage.getItem('seva_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('chat:join', { bookingId }); // reuses chat room for tracking too
    });

    socket.on('tracking:location', (payload: LiveLocation & { bookingId: string }) => {
      if (payload.bookingId !== bookingId) return;
      setLocation({
        latitude:  payload.latitude,
        longitude: payload.longitude,
        timestamp: payload.timestamp,
        source:    'live',
      });
      setTrail((prev) => [...prev.slice(-49), { lat: payload.latitude, lng: payload.longitude, t: payload.timestamp }]);
      setIsLive(true);
    });

    socket.on('disconnect', () => { setIsConnected(false); setIsLive(false); });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [bookingId]);

  return { location, trail, isLive, isConnected };
};
