import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BadgeId = 'first_booking' | 'ten_bookings' | 'fifty_bookings'
  | 'first_review' | 'top_rater' | 'diwali_champion' | 'streak_7' | 'streak_30'
  | 'big_spender' | 'early_bird' | 'referrer';

interface GamificationState {
  totalBookings: number;
  totalSpent:    number;
  streakDays:    number;
  lastVisit:     string;   // YYYY-MM-DD
  badges:        BadgeId[];

  recordVisit:   () => void;
  recordBooking: (amount: number) => void;
  unlockBadge:   (id: BadgeId) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const dateDiff = (a: string, b: string) => {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86_400_000);
};

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalBookings: 0,
      totalSpent:    0,
      streakDays:    0,
      lastVisit:     '',
      badges:        [],

      recordVisit: () => {
        const today = todayStr();
        const { lastVisit, streakDays } = get();
        if (lastVisit === today) return;          // already counted
        const diff = lastVisit ? dateDiff(lastVisit, today) : 1;
        const newStreak = diff === 1 ? streakDays + 1 : 1;
        set({ lastVisit: today, streakDays: newStreak });
        if (newStreak === 7)   get().unlockBadge('streak_7');
        if (newStreak === 30)  get().unlockBadge('streak_30');
      },

      recordBooking: (amount) => {
        const { totalBookings, totalSpent } = get();
        const newTotal = totalBookings + 1;
        const newSpent = totalSpent + amount;
        set({ totalBookings: newTotal, totalSpent: newSpent });
        if (newTotal === 1)  get().unlockBadge('first_booking');
        if (newTotal === 10) get().unlockBadge('ten_bookings');
        if (newTotal === 50) get().unlockBadge('fifty_bookings');
        if (newSpent >= 10000) get().unlockBadge('big_spender');
      },

      unlockBadge: (id) => {
        const { badges } = get();
        if (badges.includes(id)) return;
        set({ badges: [...badges, id] });
      },
    }),
    { name: 'seva_gamification' }
  )
);

export const BADGE_META: Record<BadgeId, { emoji: string; title: string; desc: string }> = {
  first_booking:   { emoji: '🎉', title: 'First Booking',     desc: 'Pehli service book ki!' },
  ten_bookings:    { emoji: '🔟', title: '10 Bookings',       desc: 'Active member!' },
  fifty_bookings:  { emoji: '👑', title: '50 Bookings',       desc: 'VIP customer!' },
  first_review:    { emoji: '⭐', title: 'First Review',      desc: 'Worker ko rating di' },
  top_rater:       { emoji: '✍️', title: 'Top Reviewer',     desc: '20+ reviews diye' },
  diwali_champion: { emoji: '🪔', title: 'Diwali Champion',   desc: 'Festival mein booking' },
  streak_7:        { emoji: '🔥', title: '7-Day Streak',      desc: '7 din continuous active' },
  streak_30:       { emoji: '💎', title: '30-Day Streak',     desc: 'Pakka customer!' },
  big_spender:     { emoji: '💰', title: 'Big Spender',       desc: '₹10,000+ spent' },
  early_bird:      { emoji: '🐦', title: 'Early Bird',        desc: 'Morning slot lover' },
  referrer:        { emoji: '🤝', title: 'Top Referrer',      desc: '5 friends laaye' },
};

// Loyalty tier helper
export const getLoyaltyTier = (bookings: number): { name: string; emoji: string; color: string; nextAt: number } => {
  if (bookings >= 50) return { name: 'Platinum', emoji: '💎', color: 'from-purple-500 to-pink-500', nextAt: -1 };
  if (bookings >= 25) return { name: 'Gold',     emoji: '👑', color: 'from-yellow-400 to-amber-500', nextAt: 50 };
  if (bookings >= 10) return { name: 'Silver',   emoji: '⭐', color: 'from-slate-400 to-slate-600',  nextAt: 25 };
  return                       { name: 'Bronze', emoji: '🥉', color: 'from-orange-400 to-amber-700', nextAt: 10 };
};
