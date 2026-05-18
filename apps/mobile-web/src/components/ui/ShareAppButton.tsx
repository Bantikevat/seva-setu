/**
 * SHARE APP LINK — Web Share API + WhatsApp fallback
 * Lets users share Seva Setu with friends for free viral growth
 */

import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  variant?: 'button' | 'icon' | 'banner';
  referralCode?: string;
  className?: string;
}

const APP_URL = 'https://sevasetu.in';
const APP_NAME = 'Seva Setu';

export const ShareAppButton = ({ variant = 'button', referralCode, className = '' }: Props) => {
  const shareUrl = referralCode ? `${APP_URL}?ref=${referralCode}` : APP_URL;

  const shareText = referralCode
    ? `🏠 Seva Setu use karo — Ujjain ka #1 home services app! Plumber, electrician, cleaner sab ghar pe. Mere referral se book karo aur discount pao! ${shareUrl}`
    : `🏠 Seva Setu — Ghar ki har zaroorat ek app mein! Verified plumber, electrician, cleaner Ujjain mein. Try karo: ${shareUrl}`;

  const handleShare = async () => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_NAME,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // User cancelled — silent
        if ((e as Error).name === 'AbortError') return;
      }
    }

    // Fallback: WhatsApp deep link
    const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(wa, '_blank');
    toast.success('WhatsApp mein share karo!');
  };

  if (variant === 'icon') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={`w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center ${className}`}
        title="Share Seva Setu"
      >
        <Share2 size={16} strokeWidth={2} className="text-ink-600 dark:text-cream-100" />
      </motion.button>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
        className={`w-full flex items-center gap-4 bg-gradient-to-r from-primary-500 to-orange-400 rounded-3xl p-5 text-left ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Share2 size={22} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">Dosto ko batao!</p>
          <p className="text-white/80 text-xs mt-0.5">App share karo — dono ko milega discount 🎁</p>
        </div>
        <span className="text-white/70 text-xl">→</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 font-medium text-sm ${className}`}
    >
      <Share2 size={15} strokeWidth={2.5} />
      App Share Karo
    </motion.button>
  );
};
