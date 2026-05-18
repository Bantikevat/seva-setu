/**
 * SEARCH — Editorial premium
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Mic, MicOff, X, ArrowUpRight, Star, MapPin } from 'lucide-react';
import { worker as workerApi } from '@/services/api';
import { startVoiceRecognition } from '@/utils/free-features';
import { useTAll } from '@/i18n/useT';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/utils/recent-searches';
import type { Worker, Category } from '@/types';

export const SearchScreen = () => {
  const navigate = useNavigate();
  const { t, tCat } = useTAll();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecentSearches());
  const voiceRef = useRef<any>(null);

  const popularSearches = ['Plumber', 'AC Repair', 'Cleaning', 'Cook', 'Electrician'];

  useEffect(() => {
    workerApi.getCategories().then((r) => { if (r.data) setCategories(r.data.categories); });
  }, []);

  const search = async (q?: string) => {
    setLoading(true);
    try {
      const res = await workerApi.search({ category: q || query || undefined, sort: 'rating', lat: 23.1765, lng: 75.7885 });
      if (res.data) setWorkers(res.data.workers);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (query) {
      search();
      const t = setTimeout(() => {
        addRecentSearch(query);
        setRecent(getRecentSearches());
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [query]);

  const handleVoice = () => {
    if (isListening) { voiceRef.current?.stop(); setIsListening(false); return; }
    const rec = startVoiceRecognition((text) => setQuery(text), 'hi-IN');
    if (!rec) { toast.error(t('search.voiceErr')); return; }
    voiceRef.current = rec;
    setIsListening(true);
    toast.success('🎤 ' + t('search.voiceTip'));
    setTimeout(() => { voiceRef.current?.stop(); setIsListening(false); }, 5000);
  };

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* MINIMAL HEADER */}
      <div className="px-6 pt-12 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
          <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
        </motion.button>
      </div>

      {/* HERO */}
      <div className="px-6 pt-6 pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
            {t('search.discover')}
          </p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-6 font-medium">
            {t('search.find')}<br />
            <span className="italic font-normal text-primary-500">{t('search.expert')}</span>
          </h1>
        </motion.div>

        {/* Premium search bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl px-5 py-4">
          <Search size={18} className="text-ink-400" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-ink-900 dark:text-cream-100 placeholder:text-ink-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} className="text-ink-400" />
            </button>
          )}
          <button
            onClick={handleVoice}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              isListening ? 'bg-primary-500 text-white animate-pulse' : 'text-primary-500'
            }`}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* POPULAR / RESULTS */}
      <div className="px-6">
        {!query ? (
          <div>
            {recent.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium">Recent Searches</p>
                  <button
                    onClick={() => { clearRecentSearches(); setRecent([]); }}
                    className="text-[10px] text-ink-400 hover:text-primary-500"
                  >Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 bg-cream-100 dark:bg-ink-800 rounded-full text-xs text-ink-700 dark:text-cream-100/80 hover:bg-primary-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">{t('search.popular')}</p>

            <div className="flex flex-wrap gap-2 mb-10">
              {popularSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-full text-sm font-medium text-ink-900 dark:text-cream-100 hover:border-primary-300 transition"
                >
                  {tCat(s)}
                </button>
              ))}
            </div>

            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">{t('search.browse')}</p>
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/workers?category=${cat.name}&emoji=${cat.emoji}`)}
                  className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-4 flex items-center justify-between text-left hover:border-primary-300 transition group"
                >
                  <div>
                    <p className="text-2xl mb-2">{cat.emoji}</p>
                    <p className="text-sm font-medium text-ink-900 dark:text-cream-50">{tCat(cat.name)}</p>
                    <p className="text-[10px] text-ink-400 mt-1">{t('common.from')} ₹{cat.basePrice}</p>
                  </div>
                  <ArrowUpRight size={12} className="text-ink-300 group-hover:text-primary-500 transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-ink-400 mb-6">
              {loading ? t('search.searching') : `${workers.length} ${t('search.results')} "${query}"`}
            </p>

            <div className="space-y-3">
              {workers.map((w, i) => (
                <motion.button
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/worker/${w.id}?category=${w.skill}&emoji=${w.skillEmoji}`)}
                  className="w-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-primary-300 transition"
                >
                  <div className="w-14 h-14 bg-gradient-warm dark:bg-ink-700 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {w.skillEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink-900 dark:text-cream-50">{w.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} className="fill-primary-500 text-primary-500" />
                        {w.ratingAverage}
                      </span>
                      <span>·</span>
                      <span>{tCat(w.skill)}</span>
                      {w.distanceKm !== null && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={9} /> {w.distanceKm}{t('common.km')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-display text-lg text-primary-500">₹{w.pricePerVisit}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <div className="h-12" />
      </div>
    </div>
  );
};
