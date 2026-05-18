/**
 * HOME — Sophisticated luxury (Cred + Apple inspired)
 * Premium cream + ink, lots of whitespace, refined typography
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Mic, ArrowUpRight, MapPin, ChevronDown,
  Home as HomeIcon, ClipboardList, Plus, User, Sparkles,
  Wrench, Zap, Snowflake, Hammer, ChefHat, Palette, Heart,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { user, ai } from '@/services/api';
import { AiChat } from '@/components/ui/AiChat';
import { SmartRebook } from '@/components/ui/SmartRebook';
import { useTAll } from '@/i18n/useT';
import { UjjainGeofence } from '@/components/ui/UjjainGeofence';
import { LiveAvailability } from '@/components/ui/LiveAvailability';
import { ShareAppButton } from '@/components/ui/ShareAppButton';
import { FirstTimeTour } from '@/components/ui/FirstTimeTour';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { AppRatingPrompt } from '@/components/ui/AppRatingPrompt';
import { FestivalBanner } from '@/components/ui/FestivalBanner';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { PincodeCheck } from '@/components/ui/PincodeCheck';
import { FloatingBookNow } from '@/components/ui/FloatingBookNow';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { TipOfTheDay } from '@/components/ui/TipOfTheDay';
import { StreakCard } from '@/components/ui/StreakCard';
import { SpinWheel } from '@/components/ui/SpinWheel';
import { useRecentlyViewed } from '@/store/recently-viewed.store';
import { useGamification } from '@/store/gamification.store';
import { Clock } from 'lucide-react';

const categories = [
  { Icon: Wrench,    name: 'Plumber',     price: 299 },
  { Icon: Zap,       name: 'Electrician', price: 349 },
  { Icon: Snowflake, name: 'AC Repair',   price: 499 },
  { Icon: Sparkles,  name: 'Cleaning',    price: 249 },
  { Icon: Hammer,    name: 'Carpenter',   price: 399 },
  { Icon: ChefHat,   name: 'Cook',        price: 499 },
  { Icon: Heart,     name: 'Beauty',      price: 599 },
  { Icon: Palette,   name: 'Painter',     price: 699 },
];

const featuredWorkers = [
  { name: 'Rajesh Kumar',  rating: 4.9, jobs: 234, skill: 'Plumber',     price: 299, Icon: Wrench },
  { name: 'Sunita Devi',   rating: 4.8, jobs: 189, skill: 'Cleaner',     price: 249, Icon: Sparkles },
  { name: 'Mohan Singh',   rating: 5.0, jobs: 312, skill: 'Electrician', price: 349, Icon: Zap },
  { name: 'Priya Nair',    rating: 4.9, jobs: 278, skill: 'Beauty',      price: 599, Icon: Heart },
];

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { t, tCat } = useTAll();

  useEffect(() => {
    user.getProfile().then((res) => res.data && setUser(res.data)).catch(() => {});
    ai.recommendServices(currentUser?.id || 'guest')
      .then((res) => res.data && setRecommendations(res.data.recommendations))
      .catch(() => {});
    // Record daily visit for streak tracking
    useGamification.getState().recordVisit();
  }, []);

  const firstName = currentUser?.name?.split(' ')[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('greet.morning');
    if (h < 17) return t('greet.afternoon');
    return t('greet.evening');
  })();

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-28">
      <FirstTimeTour />
      <AppRatingPrompt />

      {/* GEOFENCE ALERT */}
      <div className="pt-14">
        <UjjainGeofence />
      </div>

      {/* FESTIVAL BANNER */}
      <FestivalBanner />

      {/* WEATHER WIDGET — Open-Meteo, FREE */}
      <WeatherWidget />

      {/* STREAK + LOYALTY TIER */}
      <StreakCard />

      {/* TRUST BADGES */}
      <TrustBadges />

      {/* DAILY SPIN — Free Reward */}
      <SpinWheel />

      {/* TIP OF THE DAY */}
      <TipOfTheDay />

      {/* MINIMAL HEADER */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-ink-400" strokeWidth={2.5} />
            <div>
              <p className="text-[10px] text-ink-400 uppercase tracking-widest font-medium">{t('home.location')}</p>
              <button className="flex items-center gap-1 text-sm font-medium text-ink-900 dark:text-cream-100">
                Ujjain, MP
                <ChevronDown size={14} className="text-ink-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 overflow-hidden flex items-center justify-center">
              {currentUser?.profilePhoto ? (
                <img src={currentUser.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* HERO — Editorial style */}
      <div className="px-6 pt-8 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-sm text-ink-400 dark:text-cream-100/50 font-medium mb-2">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 font-medium">
            {t('home.q1')}<br />
            <span className="text-primary-500 italic font-normal">{t('home.q2')}</span> {t('home.q3')}
          </h1>
        </motion.div>
      </div>

      {/* SEARCH */}
      <div className="px-6 mb-10">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-3 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl px-5 py-4 hover:border-primary-300 transition"
        >
          <Search size={18} className="text-ink-400" strokeWidth={2} />
          <span className="flex-1 text-left text-sm text-ink-400 font-medium">
            {t('home.searchPlaceholder')}
          </span>
          <span className="text-ink-300 text-xs">|</span>
          <Mic size={16} className="text-primary-500" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* LIVE AVAILABILITY */}
      <div className="px-6 mb-6 flex items-center gap-3 flex-wrap">
        <LiveAvailability />
        <button
          onClick={() => navigate('/leaderboard')}
          className="text-xs text-ink-400 hover:text-primary-500 font-medium transition flex items-center gap-1"
        >
          🏆 Top Workers
        </button>
        <button
          onClick={() => navigate('/packages')}
          className="text-xs text-ink-400 hover:text-primary-500 font-medium transition flex items-center gap-1"
        >
          📦 Bundle Deals
        </button>
      </div>

      {/* AI Recommendation */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate(`/workers?category=${recommendations[0].category}&emoji=${recommendations[0].emoji}`)}
          className="mx-6 mb-10 bg-ink-900 text-cream-50 rounded-3xl overflow-hidden relative cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl" />

          <div className="relative p-7">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-1 bg-gold rounded-full" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
                {t('home.recommended')}
              </p>
            </div>
            <p className="font-display text-3xl tracking-tight leading-tight mb-3">
              {tCat(recommendations[0].category)}
            </p>
            <p className="text-sm text-cream-100/70 max-w-xs mb-6">
              {recommendations[0].reason}
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-gold group-hover:gap-3 transition-all">
              <span>{t('common.explore')}</span>
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>
      )}

      <SmartRebook />

      {/* CATEGORIES — Editorial */}
      <div className="px-6 mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-1">{t('home.section1')}</p>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50">
              {t('home.browse')}
            </h2>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-primary-500">
            {t('common.all')}
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/workers?category=${encodeURIComponent(cat.name)}&emoji=🔧`)}
              className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-5 flex items-center justify-between group hover:border-primary-300 transition"
            >
              <div className="text-left">
                <cat.Icon size={22} strokeWidth={2} className="text-ink-700 dark:text-cream-100 mb-3" />
                <p className="text-sm font-medium text-ink-900 dark:text-cream-50">{tCat(cat.name)}</p>
                <p className="text-xs text-ink-400 mt-1">{t('common.from')} ₹{cat.price}</p>
              </div>
              <ArrowUpRight size={14} strokeWidth={2} className="text-ink-300 group-hover:text-primary-500 transition" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* FEATURED WORKERS */}
      <div className="mb-12">
        <div className="flex items-baseline justify-between px-6 mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-1">{t('home.section2')}</p>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50">
              {t('home.topPros')}
            </h2>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-primary-500">
            {t('common.all')}
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x">
          {featuredWorkers.map((w, i) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="min-w-[180px] snap-start"
            >
              <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl overflow-hidden hover:border-primary-300 transition group cursor-pointer">
                <div className="relative h-28 bg-gradient-warm dark:bg-ink-700 flex items-center justify-center">
                  <w.Icon size={40} strokeWidth={1.5} className="text-primary-500/60 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm text-ink-900 dark:text-cream-50 mb-1">
                    {w.name}
                  </p>
                  <p className="text-[11px] text-ink-400 mb-3">{tCat(w.skill)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-primary-500 font-medium">★</span>
                      <span className="font-medium text-ink-900 dark:text-cream-50">{w.rating}</span>
                      <span className="text-ink-300">·</span>
                      <span className="text-ink-400">{w.jobs}</span>
                    </div>
                    <p className="text-sm font-medium text-ink-900 dark:text-cream-50">₹{w.price}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="px-6 mb-12">
        <div className="bg-ink-900 dark:bg-ink-950 text-cream-50 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />

          <p className="text-[10px] tracking-[0.3em] uppercase text-cream-100/40 font-medium mb-6">
            {t('home.byNumbers')}
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="font-display text-4xl tracking-tight mb-1">12<span className="text-cream-100/40">k</span></p>
              <p className="text-[10px] uppercase tracking-wider text-cream-100/50 font-medium">{t('home.pros')}</p>
            </div>
            <div className="border-l border-cream-100/10 pl-6">
              <p className="font-display text-4xl tracking-tight mb-1">60<span className="text-cream-100/40 text-base ml-1">{t('common.min')}</span></p>
              <p className="text-[10px] uppercase tracking-wider text-cream-100/50 font-medium">{t('home.avg')}</p>
            </div>
            <div className="border-l border-cream-100/10 pl-6">
              <p className="font-display text-4xl tracking-tight mb-1">4.9</p>
              <p className="text-[10px] uppercase tracking-wider text-cream-100/50 font-medium">{t('home.rating')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* OFFER */}
      <div className="px-6 mb-12">
        <div className="border-t border-ink-100 dark:border-ink-700 pt-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary-500 font-medium mb-3">
                {t('home.offer')}
              </p>
              <h3 className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50 mb-2 leading-tight">
                {t('home.offer1')}<br />{t('home.offer2')}
              </h3>
              <p className="text-sm text-ink-400 mt-3">
                {t('home.offerHint')} <span className="font-mono font-medium text-primary-500">WELCOME30</span> {t('home.offerAt')}
              </p>
            </div>
            <div className="w-14 h-14 border border-ink-200 dark:border-ink-700 rounded-2xl flex items-center justify-center">
              <Sparkles size={20} strokeWidth={1.5} className="text-primary-500" />
            </div>
          </div>
        </div>
      </div>

      {/* PINCODE AREA CHECK */}
      <PincodeCheck />

      {/* RECENTLY VIEWED WORKERS */}
      <RecentlyViewedSection />

      {/* SHARE APP */}
      <div className="px-6 mb-8">
        <ShareAppButton variant="banner" referralCode={currentUser?.referralCode} />
      </div>

      {/* HOW IT WORKS */}
      <div className="px-6 mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">
          {t('home.section3')}
        </p>

        <div className="space-y-px">
          {[
            { num: '01', title: t('home.step1.title'), desc: t('home.step1.desc') },
            { num: '02', title: t('home.step2.title'), desc: t('home.step2.desc') },
            { num: '03', title: t('home.step3.title'), desc: t('home.step3.desc') },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="py-5 border-t border-ink-100 dark:border-ink-700 flex items-baseline justify-between group cursor-pointer last:border-b"
            >
              <div className="flex items-baseline gap-4">
                <p className="font-mono text-xs text-ink-300 tabular-nums">{step.num}</p>
                <div>
                  <p className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50">
                    {step.title}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
              <ArrowUpRight size={14} strokeWidth={2} className="text-ink-300 group-hover:text-primary-500 transition" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="h-10" />

      {/* BOTTOM NAV — Subtle premium */}
      <div className="absolute bottom-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream-50/95 dark:bg-ink-900/95 backdrop-blur-2xl border-t border-ink-100 dark:border-ink-700" />

        <div className="relative grid grid-cols-5 items-center py-3 pb-4">
          <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 text-primary-500 cursor-pointer">
            <HomeIcon size={20} strokeWidth={2.2} />
            <span className="text-[9px] font-medium tracking-wider uppercase">{t('nav.home')}</span>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => navigate('/search')} className="flex flex-col items-center gap-1 text-ink-400 cursor-pointer">
            <Search size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium tracking-wider uppercase">{t('nav.search')}</span>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} className="flex items-center justify-center">
            <button className="w-12 h-12 -mt-5 bg-ink-900 dark:bg-cream-50 rounded-full flex items-center justify-center text-cream-50 dark:text-ink-900 shadow-medium">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-1 text-ink-400 cursor-pointer">
            <ClipboardList size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium tracking-wider uppercase">{t('nav.orders')}</span>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-ink-400 cursor-pointer">
            <User size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium tracking-wider uppercase">{t('nav.profile')}</span>
          </motion.div>
        </div>
      </div>

      <AiChat userId={currentUser?.id} />
      <FloatingBookNow />
    </div>
  );
};

const RecentlyViewedSection = () => {
  const navigate = useNavigate();
  const { workers } = useRecentlyViewed();
  if (!workers.length) return null;
  return (
    <div className="px-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-ink-400" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium">Recently Viewed</p>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {workers.map((w) => (
          <button
            key={w.id}
            onClick={() => navigate(`/worker/${w.id}`)}
            className="flex-shrink-0 w-24 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-300 mx-auto mb-1.5 flex items-center justify-center overflow-hidden">
              {w.photo ? <img src={w.photo} alt={w.name} className="w-full h-full object-cover" /> : <span className="text-2xl">👷</span>}
            </div>
            <p className="text-[11px] font-bold text-ink-900 dark:text-cream-50 truncate">{w.name}</p>
            <p className="text-[9px] text-ink-400 truncate">{w.skill}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
