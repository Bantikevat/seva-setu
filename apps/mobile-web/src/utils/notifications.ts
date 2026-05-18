/**
 * BROWSER NOTIFICATIONS — FREE
 * No paid push service needed.
 */
import { logger } from './logger';

export const NotificationPermission = {
  GRANTED:  'granted' as const,
  DENIED:   'denied' as const,
  DEFAULT:  'default' as const,
};

/**
 * Request notification permission
 */
export const requestPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    logger.warn('Notifications not supported');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
};

/**
 * Show a notification â€” FREE!
 */
export const notify = (title: string, body: string, opts?: { icon?: string; url?: string; vibrate?: boolean }) => {
  if (Notification.permission !== 'granted') return null;

  const notification = new Notification(title, {
    body,
    icon: opts?.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'seva-setu',
    ...(opts?.vibrate ? { vibrate: [200, 100, 200] } : {}),
  } as any);

  notification.onclick = () => {
    window.focus();
    if (opts?.url) window.location.href = opts.url;
    notification.close();
  };

  // Auto-close after 8 seconds
  setTimeout(() => notification.close(), 8000);

  return notification;
};

/**
 * Notification for booking events
 */
export const notifyBookingUpdate = (status: string, bookingNumber: string) => {
  const titles: Record<string, string> = {
    confirmed:   'âœ… Booking Confirmed!',
    on_the_way:  'ðŸš— Worker On The Way',
    in_progress: 'ðŸ› ï¸ Worker Arrived',
    completed:   'âœ¨ Job Completed!',
    cancelled:   'âŒ Booking Cancelled',
  };

  const bodies: Record<string, string> = {
    confirmed:   'Aapka worker confirm ho gaya. ETA 25 min',
    on_the_way:  'Worker aapke ghar aa raha hai. ETA 15 min',
    in_progress: 'Worker pahunch gaya. Kaam shuru!',
    completed:   'Kaam pura ho gaya. Please rate worker.',
    cancelled:   'Booking cancel ho gayi',
  };

  return notify(titles[status] || 'Booking Update', bodies[status] || `Status: ${status}`, {
    url: `/booking/${bookingNumber}`,
    vibrate: true,
  });
};
