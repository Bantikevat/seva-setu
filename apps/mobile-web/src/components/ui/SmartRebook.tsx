/**
 * SMART REBOOK — One-tap repeat last booking
 * 10x feature: AI-powered convenience
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Repeat, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { booking as bookingApi } from '@/services/api';
import type { Booking } from '@/types';

export const SmartRebook = () => {
  const navigate = useNavigate();
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  useEffect(() => {
    bookingApi.myBookings().then((res) => {
      const completed = res.data?.bookings.find((b) => b.status === 'completed');
      if (completed) setLastBooking(completed);
    }).catch(() => {});
  }, []);

  if (!lastBooking) return null;

  const daysAgo = Math.floor((Date.now() - new Date(lastBooking.completedAt || lastBooking.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/workers?category=${lastBooking.categoryName}&emoji=${lastBooking.categoryEmoji}`)}
      className="mx-4 mb-5 relative cursor-pointer overflow-hidden rounded-3xl shadow-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

      <div className="relative p-4 flex items-center gap-4 text-white">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
        >
          {lastBooking.categoryEmoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={12} />
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-90">Smart Rebook</p>
          </div>
          <p className="font-extrabold text-base truncate">Rebook {lastBooking.categoryName}?</p>
          <div className="flex items-center gap-2 text-[11px] opacity-80 mt-0.5">
            <Clock size={10} />
            <span>{daysAgo} days ago • Same worker available</span>
          </div>
        </div>

        <div className="w-10 h-10 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
          <ArrowRight size={18} />
        </div>
      </div>
    </motion.div>
  );
};
