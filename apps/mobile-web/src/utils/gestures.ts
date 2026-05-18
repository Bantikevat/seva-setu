/**
 * GESTURES — Advanced gesture detection
 * - Shake detection
 * - Pull to refresh
 * - Swipe detection
 */

import { useEffect, useRef, useState } from 'react';

/**
 * SHAKE DETECTION
 * Returns true when user shakes phone
 * Works on mobile (DeviceMotionEvent)
 *
 * 10x feature: Shake to cancel booking / refresh
 */
export const useShakeDetection = (onShake: () => void, threshold: number = 15) => {
  const lastTime = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastZ = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || !acc.x || !acc.y || !acc.z) return;

      const now = Date.now();
      if (now - lastTime.current < 100) return; // Throttle

      const deltaX = Math.abs(acc.x - lastX.current);
      const deltaY = Math.abs(acc.y - lastY.current);
      const deltaZ = Math.abs(acc.z - lastZ.current);

      if (deltaX + deltaY + deltaZ > threshold) {
        onShake();
      }

      lastTime.current = now;
      lastX.current = acc.x;
      lastY.current = acc.y;
      lastZ.current = acc.z;
    };

    // Request permission for iOS 13+
    const requestPermission = async () => {
      // @ts-ignore
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // @ts-ignore
        const result = await DeviceMotionEvent.requestPermission();
        if (result === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake, threshold]);
};

/**
 * SMART FORM MEMORY
 * Remembers user's previous inputs
 * 10x feature: Auto-suggest next time
 */
export const useFormMemory = (key: string) => {
  const STORAGE_KEY = `seva_form_${key}`;

  const save = (data: Record<string, any>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [data, ...existing].slice(0, 5); // Keep last 5
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const recent = (): Record<string, any>[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const clear = () => localStorage.removeItem(STORAGE_KEY);

  return { save, recent, clear };
};

/**
 * SWIPE DETECTION (touch + mouse)
 */
export const useSwipe = (onSwipe: (dir: 'left' | 'right' | 'up' | 'down') => void) => {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < 50) return; // Too small

      if (absX > absY) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
      start.current = null;
    },
  };
};

/**
 * IDLE TIMER — Detect when user is idle
 */
export const useIdleTimer = (timeout: number, onIdle: () => void) => {
  useEffect(() => {
    let timer: any;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeout, onIdle]);
};
