/**
 * APP RATING PROMPT — Appears after 3 completed bookings
 * Shows once, never again after user taps "Rate" or "Later"
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { shouldShowRating, markRated, openPlayStore } from '@/utils/app-rating';

export const AppRatingPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    if (shouldShowRating()) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const handleRate = () => {
    if (stars >= 4) {
      openPlayStore();
    } else {
      // For low ratings, open feedback instead
      markRated();
      setVisible(false);
    }
  };

  const handleLater = () => {
    markRated(); // Don't show again (they dismissed once)
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm"
            onClick={handleLater}
          />
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 px-4 pb-8"
          >
            <div className="bg-white dark:bg-ink-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-orange-400" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50 mb-1">
                      Seva Setu kaisa laga? 🙏
                    </p>
                    <p className="text-xs text-ink-400">Aapki 3 bookings complete ho gayi!</p>
                  </div>
                  <button onClick={handleLater} className="text-ink-300 hover:text-ink-600 transition p-1">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>

                {/* Star rating */}
                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.85 }}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setStars(s)}
                      className="transition-transform"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          s <= (hovered || stars)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-ink-200 dark:text-ink-600'
                        }`}
                        strokeWidth={1.5}
                      />
                    </motion.button>
                  ))}
                </div>

                {stars > 0 && (
                  <p className="text-center text-sm text-ink-500 dark:text-cream-100/60 mb-4">
                    {stars === 5 ? '🎉 Bahut khoob! Play Store pe rate karo?' :
                     stars === 4 ? '😊 Shukriya! Play Store pe review do?' :
                     stars === 3 ? '🙂 Theek hai, hum improve karenge!' :
                     '😔 Hume batao kya improve karein?'}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleLater}
                    className="flex-1 py-3 rounded-2xl border-2 border-ink-200 dark:border-ink-600 text-sm font-medium text-ink-500 dark:text-cream-100/60"
                  >
                    Baad mein
                  </button>
                  <button
                    onClick={handleRate}
                    disabled={stars === 0}
                    className="flex-1 py-3 rounded-2xl bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 text-sm font-semibold disabled:opacity-40 transition"
                  >
                    {stars >= 4 ? '⭐ Rate Karo' : stars > 0 ? 'Submit' : 'Stars do pehle'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
