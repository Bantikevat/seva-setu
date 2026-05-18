/**
 * NOTIFICATIONS SCREEN — Notification history center
 * URL: /notifications
 * Stores notifications in localStorage (free, no backend needed for now)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, CheckCheck, Trash2, Package, Star, AlertCircle, Info } from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'promo' | 'system';
  title: string;
  body: string;
  time: string; // ISO string
  read: boolean;
  url?: string;
}

const NOTIF_KEY = 'seva_notifications';

export const getNotifications = (): AppNotification[] => {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveNotifications = (notifs: AppNotification[]) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs.slice(0, 50))); // keep last 50
};

export const pushNotification = (notif: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
  const notifs = getNotifications();
  notifs.unshift({ ...notif, id: `n_${Date.now()}`, read: false, time: new Date().toISOString() });
  saveNotifications(notifs);
  // Also dispatch event so NotificationBell can update badge count
  window.dispatchEvent(new Event('seva_notif_update'));
};

const TYPE_ICON: Record<AppNotification['type'], React.ReactNode> = {
  booking:  <Package size={18} className="text-primary-500" strokeWidth={2} />,
  payment:  <span className="text-base">💳</span>,
  review:   <Star size={18} className="text-yellow-500" strokeWidth={2} />,
  promo:    <span className="text-base">🎁</span>,
  system:   <Info size={18} className="text-blue-500" strokeWidth={2} />,
};

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Abhi';
  if (min < 60) return `${min} min pehle`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ghante pehle`;
  return `${Math.floor(hr / 24)} din pehle`;
};

export const NotificationsScreen = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  const reload = () => setNotifs(getNotifications());

  useEffect(() => {
    reload();
    // Seed some demo notifications if empty
    const existing = getNotifications();
    if (existing.length === 0) {
      const demos: AppNotification[] = [
        {
          id: 'demo1',
          type: 'booking',
          title: '✅ Booking Confirmed!',
          body: 'Rajesh Kumar aapke ghar 2 bajey aayenge — Plumbing service',
          time: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          url: '/bookings',
        },
        {
          id: 'demo2',
          type: 'promo',
          title: '🎁 Special Offer!',
          body: 'Pehli booking pe 30% off — code WELCOME30 use karo',
          time: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
        {
          id: 'demo3',
          type: 'system',
          title: '🚀 Seva Setu mein Aapka Swagat!',
          body: 'Ujjain ke sabse behtar home service professionals aapki service mein hain.',
          time: new Date(Date.now() - 2 * 86400000).toISOString(),
          read: true,
        },
      ];
      saveNotifications(demos);
      setNotifs(demos);
    }
  }, []);

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifs(updated);
    window.dispatchEvent(new Event('seva_notif_update'));
  };

  const deleteNotif = (id: string) => {
    const updated = notifs.filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifs(updated);
    window.dispatchEvent(new Event('seva_notif_update'));
  };

  const handleTap = (notif: AppNotification) => {
    const updated = notifs.map((n) => n.id === notif.id ? { ...n, read: true } : n);
    saveNotifications(updated);
    setNotifs(updated);
    window.dispatchEvent(new Event('seva_notif_update'));
    if (notif.url) navigate(notif.url);
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* HEADER */}
      <div className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 mb-5">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell size={22} className="text-primary-500" strokeWidth={2} />
              <h1 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50">
                Notifications
              </h1>
              {unread > 0 && (
                <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <p className="text-xs text-ink-400">{notifs.length} total notifications</p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-primary-500 font-medium"
            >
              <CheckCheck size={14} strokeWidth={2.5} />
              Sab Read Karo
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
            <BellOff size={28} strokeWidth={1.5} className="text-ink-300" />
          </div>
          <p className="text-ink-500 dark:text-cream-100/50 text-sm">Koi notification nahi abhi</p>
        </div>
      ) : (
        <div className="divide-y divide-ink-100 dark:divide-ink-700">
          <AnimatePresence>
            {notifs.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: 0.03 * i }}
                className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition ${
                  !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'bg-white dark:bg-ink-900'
                }`}
                onClick={() => handleTap(notif)}
              >
                <div className="w-10 h-10 rounded-2xl bg-cream-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {TYPE_ICON[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-ink-900 dark:text-cream-50' : 'font-medium text-ink-700 dark:text-cream-100/70'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">{notif.body}</p>
                  <p className="text-[10px] text-ink-300 dark:text-ink-600 mt-1">{relativeTime(notif.time)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                  className="flex-shrink-0 text-ink-300 hover:text-red-400 transition mt-0.5 p-1"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Enable notifications CTA */}
      {Notification.permission !== 'granted' && (
        <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3">
          <Bell size={18} className="text-blue-500 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Live notifications on karo</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">Booking updates seedha phone pe aayenge</p>
          </div>
          <button
            onClick={() => Notification.requestPermission()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-900/40 px-3 py-1.5 rounded-xl"
          >
            On Karo
          </button>
        </div>
      )}
    </div>
  );
};
