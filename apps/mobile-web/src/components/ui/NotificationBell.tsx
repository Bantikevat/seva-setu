/**
 * NOTIFICATION BELL — Badge count + navigate to /notifications
 * Replace the existing dumb Bell button on HomeScreen
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { getNotifications } from '@/screens/NotificationsScreen';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const refresh = () => {
    const notifs = getNotifications();
    setUnread(notifs.filter((n) => !n.read).length);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('seva_notif_update', refresh);
    return () => window.removeEventListener('seva_notif_update', refresh);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/notifications')}
      className="relative w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
    >
      <Bell size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
      {unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold px-1"
        >
          {unread > 9 ? '9+' : unread}
        </motion.span>
      )}
    </motion.button>
  );
};
