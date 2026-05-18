/**
 * WORKER LEADERBOARD — Top 10 workers, public page
 * URL: /leaderboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Briefcase, TrendingUp } from 'lucide-react';
import { worker as workerApi } from '@/services/api';
import type { Worker } from '@/types';

interface LeaderEntry {
  id: string;
  name: string;
  categoryName: string;
  rating: number;
  totalJobs: number;
  profilePhoto?: string;
  categoryEmoji?: string;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'rating' | 'jobs'>('rating');

  useEffect(() => {
    workerApi.search({ sort: 'rating' })
      .then((res) => {
        const workers = res.data?.workers || [];
        const list: LeaderEntry[] = workers.map((w: Worker) => ({
          id: w.id,
          name: w.name,
          categoryName: w.skill || 'Worker',
          rating: w.ratingAverage ?? 0,
          totalJobs: w.totalJobs ?? 0,
          profilePhoto: w.profilePhoto || undefined,
          categoryEmoji: w.skillEmoji || '🔧',
        }));
        setLeaders(list);
      })
      .catch(() => {
        // Show demo data if API unavailable
        setLeaders([
          { id: '1', name: 'Rajesh Kumar',  categoryName: 'Plumber',     rating: 4.9, totalJobs: 312, categoryEmoji: '🔧' },
          { id: '2', name: 'Sunita Devi',   categoryName: 'Cleaner',     rating: 4.8, totalJobs: 289, categoryEmoji: '✨' },
          { id: '3', name: 'Mohan Singh',   categoryName: 'Electrician', rating: 4.8, totalJobs: 245, categoryEmoji: '⚡' },
          { id: '4', name: 'Priya Nair',    categoryName: 'Beauty',      rating: 4.7, totalJobs: 201, categoryEmoji: '💄' },
          { id: '5', name: 'Vikram Patel',  categoryName: 'Carpenter',   rating: 4.7, totalJobs: 178, categoryEmoji: '🪵' },
          { id: '6', name: 'Anita Sharma',  categoryName: 'Cook',        rating: 4.6, totalJobs: 156, categoryEmoji: '👨‍🍳' },
          { id: '7', name: 'Ramu Yadav',    categoryName: 'Painter',     rating: 4.6, totalJobs: 143, categoryEmoji: '🎨' },
          { id: '8', name: 'Meena Gupta',   categoryName: 'Beauty',      rating: 4.5, totalJobs: 132, categoryEmoji: '💄' },
          { id: '9', name: 'Deepak Joshi',  categoryName: 'AC Repair',   rating: 4.5, totalJobs: 119, categoryEmoji: '❄️' },
          { id: '10', name: 'Kavita Tiwari', categoryName: 'Cleaner',    rating: 4.4, totalJobs: 98, categoryEmoji: '✨' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...leaders].sort((a, b) =>
    tab === 'rating' ? b.rating - a.rating : b.totalJobs - a.totalJobs
  ).slice(0, 10);

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* HEADER */}
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 mb-6">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={28} className="text-yellow-500" strokeWidth={2} />
          <h1 className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50">
            Top Workers
          </h1>
        </div>
        <p className="text-sm text-ink-400">Ujjain ke sabse behtar professionals</p>
      </div>

      {/* TOP 3 PODIUM */}
      {!loading && sorted.length >= 3 && (
        <div className="mx-6 mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-ink-800 dark:to-ink-700 rounded-3xl p-6">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-ink-600 border-4 border-gray-300 flex items-center justify-center text-2xl mb-2 shadow">
                {sorted[1].profilePhoto
                  ? <img src={sorted[1].profilePhoto} className="w-full h-full rounded-full object-cover" />
                  : sorted[1].categoryEmoji}
              </div>
              <div className="bg-gray-200 dark:bg-ink-600 rounded-xl px-3 py-4 text-center min-w-[80px]">
                <p className="text-lg">🥈</p>
                <p className="text-xs font-semibold text-ink-900 dark:text-cream-50 mt-1 truncate max-w-[72px]">{sorted[1].name.split(' ')[0]}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">★ {sorted[1].rating}</p>
              </div>
            </motion.div>

            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center -mb-2"
            >
              <div className="w-20 h-20 rounded-full bg-white dark:bg-ink-600 border-4 border-yellow-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
                {sorted[0].profilePhoto
                  ? <img src={sorted[0].profilePhoto} className="w-full h-full rounded-full object-cover" />
                  : sorted[0].categoryEmoji}
              </div>
              <div className="bg-yellow-400 rounded-xl px-3 py-5 text-center min-w-[90px]">
                <p className="text-2xl">🥇</p>
                <p className="text-xs font-bold text-ink-900 mt-1 truncate max-w-[82px]">{sorted[0].name.split(' ')[0]}</p>
                <p className="text-[10px] text-ink-700 mt-0.5">★ {sorted[0].rating}</p>
              </div>
            </motion.div>

            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-ink-600 border-4 border-orange-400 flex items-center justify-center text-2xl mb-2 shadow">
                {sorted[2].profilePhoto
                  ? <img src={sorted[2].profilePhoto} className="w-full h-full rounded-full object-cover" />
                  : sorted[2].categoryEmoji}
              </div>
              <div className="bg-orange-200 dark:bg-ink-600 rounded-xl px-3 py-4 text-center min-w-[80px]">
                <p className="text-lg">🥉</p>
                <p className="text-xs font-semibold text-ink-900 dark:text-cream-50 mt-1 truncate max-w-[72px]">{sorted[2].name.split(' ')[0]}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">★ {sorted[2].rating}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="mx-6 mb-4 flex bg-cream-100 dark:bg-ink-800 rounded-2xl p-1">
        {(['rating', 'jobs'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === t
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-cream-50 shadow-sm'
                : 'text-ink-400'
            }`}
          >
            {t === 'rating' ? <Star size={14} strokeWidth={2} /> : <Briefcase size={14} strokeWidth={2} />}
            {t === 'rating' ? 'Top Rated' : 'Most Jobs'}
          </button>
        ))}
      </div>

      {/* FULL LIST */}
      <div className="mx-6 space-y-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-cream-100 dark:bg-ink-800 rounded-2xl animate-pulse" />
            ))
          : sorted.map((worker, i) => (
              <motion.button
                key={worker.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => navigate(`/worker/${worker.id}`)}
                className="w-full flex items-center gap-3 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-4 hover:border-primary-300 transition"
              >
                <span className="text-lg font-bold w-7 text-center text-ink-400 font-mono">
                  {MEDAL[i] || `${i + 1}`}
                </span>
                <div className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-700 flex items-center justify-center text-xl flex-shrink-0">
                  {worker.profilePhoto
                    ? <img src={worker.profilePhoto} className="w-full h-full rounded-full object-cover" />
                    : worker.categoryEmoji}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm text-ink-900 dark:text-cream-50 truncate">{worker.name}</p>
                  <p className="text-[11px] text-ink-400 truncate">{worker.categoryName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-ink-900 dark:text-cream-50">{worker.rating}</span>
                  </div>
                  <p className="text-[10px] text-ink-400 mt-0.5">{worker.totalJobs} jobs</p>
                </div>
              </motion.button>
            ))}
      </div>

      <div className="mx-6 mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-start gap-3">
        <TrendingUp size={16} className="text-primary-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="text-xs text-ink-500 dark:text-cream-100/60 leading-relaxed">
          Leaderboard har roz update hota hai based on ratings aur completed jobs. Aap bhi top mein aa sakte ho — quality kaam karo!
        </p>
      </div>
    </div>
  );
};
