/**
 * BOOKINGS — Premium editorial with ALL big-app features
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Search, ArrowUpRight, Clock, MapPin, Star, Phone,
  Navigation, Repeat, MessageCircle, Receipt, Share2, X, SlidersHorizontal,
  CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';
import { booking as bookingApi } from '@/services/api';
import { downloadCalendarEvent } from '@/utils/extra-free';
import { whatsAppShareBooking, copyToClipboard } from '@/utils/free-features';
import { printReceipt } from '@/utils/receipt';
import { exportToCsv } from '@/utils/csv-export';
import { generatePdfReceipt } from '@/utils/pdf-receipt';
import { useTAll } from '@/i18n/useT';
import type { Booking, BookingStatus } from '@/types';

const statusColors: Record<BookingStatus, { color: string; bg: string; pulse?: boolean }> = {
  pending:     { color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     pulse: true },
  confirmed:   { color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20',       pulse: true },
  on_the_way:  { color: 'text-purple-700 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/20',   pulse: true },
  in_progress: { color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/20', pulse: true },
  completed:   { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  cancelled:   { color: 'text-ink-500 dark:text-ink-300',         bg: 'bg-ink-100 dark:bg-ink-800' },
  rejected:    { color: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20' },
};

const groupByDate = (bookings: Booking[]) => {
  const groups: Record<string, Booking[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);   weekAgo.setDate(weekAgo.getDate() - 7);

  bookings.forEach((b) => {
    const date = new Date(b.scheduledAt || b.createdAt);
    let key: string;
    if (date >= today)          key = 'Today';
    else if (date >= yesterday) key = 'Yesterday';
    else if (date >= weekAgo)   key = 'This Week';
    else                        key = 'Earlier';
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });
  return groups;
};

export const BookingsScreen = () => {
  const navigate = useNavigate();
  const { t, tCat } = useTAll();

  const TABS = [
    { key: 'all',       label: t('bk.tabAll') },
    { key: 'active',    label: t('bk.tabActive') },
    { key: 'completed', label: t('bk.tabDone') },
    { key: 'cancelled', label: t('bk.tabCancelled') },
  ];

  const SORT_OPTIONS = [
    { key: 'recent',   label: t('bk.sortRecent') },
    { key: 'oldest',   label: t('bk.sortOldest') },
    { key: 'price_hl', label: t('bk.sortPriceHL') },
    { key: 'price_lh', label: t('bk.sortPriceLH') },
  ];

  const groupLabels: Record<string, string> = {
    Today:       t('bk.todayKey'),
    Yesterday:   t('bk.yesterdayKey'),
    'This Week': t('bk.thisWeek'),
    Earlier:     t('bk.earlier'),
  };

  const statusLabels: Record<BookingStatus, string> = {
    pending:     t('bk.label.pending'),
    confirmed:   t('bk.label.confirmed'),
    on_the_way:  t('bk.label.on_the_way'),
    in_progress: t('bk.label.in_progress'),
    completed:   t('bk.label.completed'),
    cancelled:   t('bk.label.cancelled'),
    rejected:    t('bk.label.rejected'),
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await bookingApi.myBookings();
      if (res.data) setBookings(res.data.bookings);
    } catch {
      toast.error(t('bk.failedLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...bookings];

    if (activeTab === 'active')    list = list.filter((b) => ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status));
    if (activeTab === 'completed') list = list.filter((b) => b.status === 'completed');
    if (activeTab === 'cancelled') list = list.filter((b) => ['cancelled', 'rejected'].includes(b.status));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) =>
        b.categoryName.toLowerCase().includes(q) ||
        b.workerName.toLowerCase().includes(q) ||
        b.bookingNumber.toLowerCase().includes(q) ||
        b.fullAddress.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'recent')   list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sortBy === 'oldest')   list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    if (sortBy === 'price_hl') list.sort((a, b) => b.totalAmount - a.totalAmount);
    if (sortBy === 'price_lh') list.sort((a, b) => a.totalAmount - b.totalAmount);

    return list;
  }, [bookings, activeTab, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const active = bookings.filter((b) => ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status)).length;
    const spent = bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0);
    return { total, completed, active, spent };
  }, [bookings]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleRebook = (b: Booking) => {
    // Same worker available? Direct booking. Else workers list with category prefilter.
    if (b.workerId) {
      navigate(`/worker/${b.workerId}?rebook=1`);
      toast.success(`${b.workerName || 'Worker'} ko dobara book karo!`);
    } else {
      navigate(`/workers?category=${b.categoryName}&emoji=${b.categoryEmoji}`);
    }
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
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSortMenu(!showSortMenu)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
              <SlidersHorizontal size={16} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => load(true)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}>
                <Repeat size={16} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
              </motion.div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!bookings.length) return toast.error('Koi booking nahi');
                exportToCsv(
                  bookings.map((b) => ({
                    BookingNumber: b.bookingNumber,
                    Category:      b.categoryName || '',
                    Worker:        b.workerName || '',
                    Status:        b.status,
                    Date:          new Date(b.scheduledAt || b.createdAt).toLocaleString('en-IN'),
                    Amount:        b.totalAmount || 0,
                  })),
                  `seva-bookings-${new Date().toISOString().slice(0, 10)}`
                );
                toast.success('Bookings CSV download ho gaya');
              }}
              className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
              title="Export CSV"
            >
              <span className="text-[10px] font-bold text-ink-700 dark:text-cream-100">CSV</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 flex items-center gap-2 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl px-4 py-2.5">
                <Search size={16} className="text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('bk.searchPlaceholder')}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-ink-900 dark:text-cream-100 placeholder:text-ink-400"
                  autoFocus
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-ink-400" /></button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSortMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-2">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { setSortBy(s.key); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition ${
                      sortBy === s.key ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-500' : 'text-ink-700 dark:text-cream-100 hover:bg-cream-50 dark:hover:bg-ink-700'
                    }`}
                  >
                    {sortBy === s.key && '● '}{s.label}
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
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">{t('bk.title')}</p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-2 font-medium">
            {t('bk.your')}<br />
            <span className="italic font-normal text-primary-500">{t('bk.bookings')}</span>
          </h1>
        </motion.div>
      </div>

      {/* STATS GRID */}
      <div className="px-6 mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">{t('bk.section1')}</p>

        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-ink-900 dark:bg-ink-950 text-cream-50 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/15 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-2">{t('bk.spent')}</p>
              <p className="font-display text-3xl tracking-tight font-medium">₹{stats.spent}</p>
              <p className="text-[11px] text-cream-100/50 mt-1">{stats.completed} {t('bk.completedCount')}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-2">{t('bk.activeNow')}</p>
            <p className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50 font-medium">{stats.active}</p>
            <p className="text-[11px] text-ink-400 mt-1">{stats.total} {t('bk.allTime')}</p>
          </motion.div>
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium">{t('bk.section2')}</p>
          <p className="text-xs text-ink-400">{filtered.length} {filtered.length === 1 ? t('bk.result') : t('bk.results')}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const count =
              tab.key === 'all'       ? bookings.length :
              tab.key === 'active'    ? stats.active :
              tab.key === 'completed' ? stats.completed :
              bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status)).length;

            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900'
                    : 'bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-700 dark:text-cream-100'
                }`}
              >
                {tab.label}{count > 0 && <span className="opacity-60"> · {count}</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      <div className="px-6 space-y-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-cream-100 dark:bg-ink-800 rounded-3xl h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState navigate={navigate} hasFilter={!!searchQuery || activeTab !== 'all'} t={t} />
        ) : (
          Object.entries(grouped).map(([groupName, groupBookings]) => (
            <div key={groupName}>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-ink-400">{groupLabels[groupName] || groupName}</p>
                <div className="flex-1 h-px bg-ink-100 dark:bg-ink-700" />
                <p className="text-[10px] text-ink-400 font-mono">{groupBookings.length}</p>
              </div>

              <div className="space-y-3">
                {groupBookings.map((b, i) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    index={i}
                    onClick={() => navigate(`/booking/${b.id}`)}
                    onTrack={() => navigate(`/tracking/${b.id}`)}
                    onRebook={() => handleRebook(b)}
                    onShare={() => whatsAppShareBooking('', b)}
                    onCall={() => window.location.href = `tel:${b.workerPhone}`}
                    onCalendar={() => { downloadCalendarEvent(b); toast.success(t('bk.calDownloaded')); }}
                    onReceipt={() => printReceipt(b)}
                    onCopyId={async () => { await copyToClipboard(b.bookingNumber); toast.success(t('bk.copied')); }}
                    statusLabels={statusLabels}
                    tCat={tCat}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="h-12" />
      </div>
    </div>
  );
};

// ───── BOOKING CARD ─────
const BookingCard = ({ booking: b, index, onClick, onTrack, onRebook, onShare, onCall, onCalendar, onReceipt, onCopyId, statusLabels, tCat, t }: any) => {
  const cfg = { ...statusColors[b.status as BookingStatus], label: statusLabels[b.status as BookingStatus] };
  const isActive = ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status);
  const isCompleted = b.status === 'completed';
  const isCancelled = ['cancelled', 'rejected'].includes(b.status);
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 18 }}
      className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl overflow-hidden hover:border-primary-300 transition-colors"
    >
      <div onClick={onClick} className="p-5 cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.color} text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-full`}>
            {cfg.pulse && <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
            {cfg.label}
          </div>
          {b.paymentStatus === 'paid' && (
            <div className="flex items-center gap-1 text-[10px] font-medium tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={11} /> {t('bk.paid')}
            </div>
          )}
          {b.paymentStatus !== 'paid' && !isCancelled && (
            <div className="flex items-center gap-1 text-[10px] font-medium tracking-wider text-amber-600">
              <AlertCircle size={11} /> {t('bk.unpaid')}
            </div>
          )}
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50 leading-none mb-1.5">{tCat(b.categoryName)}</p>
            <p className="text-[11px] text-ink-400 font-mono">{b.bookingNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl tracking-tight text-primary-500 leading-none">₹{b.totalAmount}</p>
            {b.rating && (
              <div className="flex items-center justify-end gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} className={s <= b.rating ? 'fill-primary-500 text-primary-500' : 'text-ink-200'} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-ink-100 dark:border-ink-700">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-cream-100 dark:bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-ink-700 dark:text-cream-100">{b.workerName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-900 dark:text-cream-50 truncate">{b.workerName}</p>
              <p className="text-[10px] text-ink-400 truncate">
                {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-ink-400">
            <MapPin size={10} strokeWidth={2} />
            <span className="truncate max-w-[80px]">{b.fullAddress.split(',')[0]}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            {isActive && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); onTrack(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-full">
                <Navigation size={11} strokeWidth={2.5} />
                {t('bk.trackBtn')}
              </motion.button>
            )}
            {isActive && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); onCall(); }} className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center">
                <Phone size={12} strokeWidth={2.5} />
              </motion.button>
            )}
            {(isCompleted || isCancelled) && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); onRebook(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 text-xs font-medium rounded-full">
                <Repeat size={11} strokeWidth={2.5} />
                {t('bk.rebookBtn')}
              </motion.button>
            )}
          </div>

          <button onClick={(e) => { e.stopPropagation(); setActionsOpen(!actionsOpen); }} className="text-xs font-medium text-ink-400 flex items-center gap-1">
            {t('bk.more')}
            <ArrowUpRight size={11} className={`transition-transform ${actionsOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {actionsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 grid grid-cols-4 gap-2">
                <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex flex-col items-center gap-1 py-2 hover:bg-cream-50 dark:hover:bg-ink-700 rounded-xl">
                  <MessageCircle size={14} strokeWidth={2} className="text-emerald-500" />
                  <span className="text-[9px] font-medium text-ink-700 dark:text-cream-100">{t('bk.whatsapp')}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCalendar(); }} className="flex flex-col items-center gap-1 py-2 hover:bg-cream-50 dark:hover:bg-ink-700 rounded-xl">
                  <Clock size={14} strokeWidth={2} className="text-blue-500" />
                  <span className="text-[9px] font-medium text-ink-700 dark:text-cream-100">{t('bk.calendar')}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onReceipt(); }} className="flex flex-col items-center gap-1 py-2 hover:bg-cream-50 dark:hover:bg-ink-700 rounded-xl">
                  <Receipt size={14} strokeWidth={2} className="text-purple-500" />
                  <span className="text-[9px] font-medium text-ink-700 dark:text-cream-100">{t('bk.receipt')}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCopyId(); }} className="flex flex-col items-center gap-1 py-2 hover:bg-cream-50 dark:hover:bg-ink-700 rounded-xl">
                  <Share2 size={14} strokeWidth={2} className="text-ink-500" />
                  <span className="text-[9px] font-medium text-ink-700 dark:text-cream-100">{t('bk.copyId')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ───── EMPTY STATE ─────
const EmptyState = ({ navigate, hasFilter, t }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center">
    <div className="w-16 h-16 border border-ink-200 dark:border-ink-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <Sparkles size={20} strokeWidth={1.5} className="text-primary-500" />
    </div>

    <p className="font-display text-2xl text-ink-900 dark:text-cream-50 tracking-tight mb-2">
      {hasFilter ? t('bk.emptyFiltered') : t('bk.emptyFirst')}
    </p>
    <p className="text-sm text-ink-400 mb-6 max-w-xs mx-auto">
      {hasFilter ? t('bk.emptyFilteredDesc') : t('bk.emptyFirstDesc')}
    </p>

    {!hasFilter && (
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/home')} className="inline-flex items-center gap-2 bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 text-sm font-medium px-5 py-3 rounded-full">
        {t('bk.browseServices')}
        <ArrowUpRight size={14} strokeWidth={2.5} />
      </motion.button>
    )}
  </motion.div>
);
