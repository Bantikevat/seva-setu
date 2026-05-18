/**
 * FAVORITES SCREEN — Customer's saved / favorite workers
 * URL: /favorites
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, ArrowUpRight } from 'lucide-react';
import { useFavoritesStore } from '@/store/favorites.store';
import { worker as workerApi } from '@/services/api';
import type { WorkerProfile } from '@/types';

export const FavoritesScreen = () => {
  const navigate = useNavigate();
  const { favorites, toggle } = useFavoritesStore();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setLoading(false);
      return;
    }
    // Fetch all favorites in parallel
    Promise.all(
      favorites.map((id) =>
        workerApi.getProfile(id).then((r) => r.data).catch(() => null)
      )
    )
      .then((results) => setWorkers(results.filter(Boolean) as WorkerProfile[]))
      .finally(() => setLoading(false));
  }, [favorites.join(',')]);

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 mb-6">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Heart size={26} className="text-primary-500 fill-primary-500" strokeWidth={2} />
          <h1 className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50">
            Favorite Workers
          </h1>
        </div>
        <p className="text-sm text-ink-400">{favorites.length} saved workers</p>
      </div>

      {loading ? (
        <div className="px-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-ink-100 dark:bg-ink-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <Heart size={32} strokeWidth={1.5} className="text-primary-300" />
          </div>
          <h2 className="font-display text-xl text-ink-700 dark:text-cream-100/70 mb-2">Koi favorite nahi</h2>
          <p className="text-sm text-ink-400 max-w-xs">
            Worker profile pe dil ❤️ icon dabao unhe yahan save karne ke liye.
          </p>
          <button
            onClick={() => navigate('/workers')}
            className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary-500"
          >
            Workers Dekho <ArrowUpRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="px-6 space-y-3">
          {workers.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-center gap-4 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-4"
            >
              <div
                className="flex-1 flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/worker/${w.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-cream-100 dark:bg-ink-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {w.profilePhoto
                    ? <img src={w.profilePhoto} className="w-full h-full object-cover" />
                    : <span className="text-xl">🔧</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 dark:text-cream-50 truncate">{w.name}</p>
                  <p className="text-xs text-ink-400 truncate">{w.skills?.[0]?.categoryName || 'Worker'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-ink-700 dark:text-cream-100/70">{w.ratingAverage}</span>
                    <span className="text-xs text-ink-400">· {w.totalJobs} jobs</span>
                  </div>
                </div>
                <ArrowUpRight size={16} strokeWidth={2} className="text-ink-300 flex-shrink-0" />
              </div>
              <button
                onClick={() => toggle(w.id)}
                className="ml-2 w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0"
              >
                <Heart size={16} className="fill-primary-500 text-primary-500" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
