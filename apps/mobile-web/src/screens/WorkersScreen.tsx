/**
 * WORKERS â€” Editorial premium luxury
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowUpRight, Star, BadgeCheck, MapPin, Clock,
  Heart, SlidersHorizontal, Search, X,
} from 'lucide-react';
import { worker as workerApi } from '@/services/api';
import { useTAll } from '@/i18n/useT';
import { QuickFilters, type QuickFilter } from '@/components/ui/QuickFilters';
import type { Worker } from '@/types';
import { logger } from '@/utils/logger';

export const WorkersScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const category = params.get('category') || '';
  const emoji = params.get('emoji') || 'ðŸ”§';
  const { t, tCat } = useTAll();

  const SORT_OPTIONS = [
    { key: 'rating',   label: t('workers.topRated') },
    { key: 'distance', label: t('workers.nearest') },
    { key: 'price',    label: t('workers.cheapest') },
  ];

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'rating' | 'distance' | 'price'>('rating');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await workerApi.search({ category, sort, lat: 23.1765, lng: 75.7885 });
      if (res.data) setWorkers(res.data.workers);
    } catch (err) { logger.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, sort]);

  const filtered = useMemo(() => {
    let list = workers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((w) =>
        w.name.toLowerCase().includes(q) || w.skill.toLowerCase().includes(q)
      );
    }
    if (quickFilter === 'open_now')  list = list.filter((w) => w.isAvailable);
    if (quickFilter === 'under_500') list = list.filter((w) => (w.pricePerVisit ?? 0) < 500);
    if (quickFilter === 'top_rated') list = list.filter((w) => (w.ratingAverage ?? 0) >= 4.5);
    if (quickFilter === 'fastest')   list = list.filter((w) => (w.distanceKm ?? 99) < 5);
    return list;
  }, [workers, searchQuery, quickFilter]);

  const toggleFav = (id: string) => {
    const newFav = new Set(favorites);
    if (newFav.has(id)) newFav.delete(id); else newFav.add(id);
    setFavorites(newFav);
  };

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* MINIMAL HEADER */}
      <div className="px-6 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
            <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSearch(!showSearch)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
              <Search size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSort(!showSort)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
              <SlidersHorizontal size={16} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
            </motion.button>
          </div>
        </div>

        {/* Collapsible search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 flex items-center gap-2 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl px-4 py-2.5">
                <Search size={16} className="text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('workers.searchByName')}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-ink-900 dark:text-cream-100 placeholder:text-ink-400"
                  autoFocus
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-ink-400" /></button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort menu */}
        <AnimatePresence>
          {showSort && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-2">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { setSort(s.key as any); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition ${
                      sort === s.key ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-500' : 'text-ink-700 dark:text-cream-100'
                    }`}
                  >
                    {sort === s.key && 'â— '}{s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EDITORIAL HERO */}
      <div className="px-6 pt-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
            {t('workers.browsing')}
          </p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-2 font-medium">
            {category ? tCat(category) : t('common.all')}
            <span className="italic font-normal text-primary-500"> {t('workers.professionals')}</span>
          </h1>
          <p className="text-sm text-ink-400 mt-3">
            {filtered.length} {t('workers.nearYou')}
          </p>
        </motion.div>
      </div>

      {/* WORKERS LIST */}
      <div className="px-6 space-y-px">
        {/* Section heading */}
        <div className="flex items-center gap-3 mb-6">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-ink-400">
            {sort === 'rating' ? t('workers.topRated') : sort === 'distance' ? t('workers.nearestLabel') : t('workers.bestPrice')}
          </p>
          <div className="flex-1 h-px bg-ink-100 dark:bg-ink-700" />
          <p className="text-[10px] text-ink-400 font-mono">{filtered.length}</p>
        </div>

        <div className="-mx-6 mb-4">
          <QuickFilters active={quickFilter} onChange={setQuickFilter} />
        </div>

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-cream-100 dark:bg-ink-800 rounded-3xl h-48 relative overflow-hidden mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border border-ink-200 dark:border-ink-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search size={20} strokeWidth={1.5} className="text-ink-400" />
            </div>
            <p className="font-display text-2xl text-ink-900 dark:text-cream-50 tracking-tight mb-2">{t('workers.noResults')}</p>
            <p className="text-sm text-ink-400">{t('workers.tryAgain')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((w, i) => (
              <WorkerCard key={w.id} worker={w} index={i} isFav={favorites.has(w.id)} onToggleFav={() => toggleFav(w.id)} onClick={() => navigate(`/worker/${w.id}?category=${category}&emoji=${emoji}`)} emoji={emoji} tCat={tCat} t={t} />
            ))}
          </div>
        )}
        <div className="h-12" />
      </div>
    </div>
  );
};

// â”€â”€â”€â”€â”€ WORKER CARD â”€â”€â”€â”€â”€
const WorkerCard = ({ worker: w, index, isFav, onToggleFav, onClick, emoji, tCat, t }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 18 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl overflow-hidden hover:border-primary-300 transition cursor-pointer"
    >
      {/* Avatar header */}
      <div className="relative h-32 bg-gradient-warm dark:bg-ink-700 flex items-center justify-center">
        <div className="text-6xl opacity-90">{emoji || w.skillEmoji}</div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {w.isAvailable && (
            <div className="bg-white/95 dark:bg-ink-900/95 backdrop-blur-md text-ink-700 dark:text-cream-100 text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {t('workers.available')}
            </div>
          )}
          {w.isVerified && (
            <div className="bg-white/95 dark:bg-ink-900/95 backdrop-blur-md text-ink-700 dark:text-cream-100 text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <BadgeCheck size={11} className="fill-green-500 text-white" />
              {t('workers.verifiedTag')}
            </div>
          )}
        </div>

        {/* Favorite */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md rounded-full flex items-center justify-center"
        >
          <Heart size={16} className={isFav ? 'fill-primary-500 text-primary-500' : 'text-ink-500'} />
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50 mb-1">
              {w.name}
            </h3>
            <p className="text-xs text-ink-400">{tCat(w.skill)} Â· {w.experienceYears}+ {t('common.years')}</p>
          </div>

          <div className="text-right ml-3 flex-shrink-0">
            <div className="flex items-center gap-1 mb-1">
              <Star size={11} className="fill-primary-500 text-primary-500" />
              <span className="font-medium text-sm text-ink-900 dark:text-cream-50">{w.ratingAverage}</span>
              <span className="text-[10px] text-ink-400">({w.totalJobs})</span>
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div className="pt-3 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-ink-400">
            {w.distanceKm !== null && (
              <span className="flex items-center gap-1">
                <MapPin size={10} strokeWidth={2} />
                <span className="font-medium">{w.distanceKm} {t('common.km')}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} strokeWidth={2} />
              <span className="font-medium">60 {t('common.min')}</span>
            </span>
            {w.totalJobs > 200 && (
              <span className="text-primary-500 font-medium">{t('workers.popular')}</span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-ink-400 uppercase tracking-wider">{t('common.from')}</span>
            <span className="font-display text-xl tracking-tight text-primary-500">
              â‚¹{w.pricePerVisit}
            </span>
            <ArrowUpRight size={14} strokeWidth={2.5} className="text-ink-400 ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
