/**
 * FIRST TIME TOUR — Guided onboarding for new users (3 step overlay)
 * Only shows once, then never again (localStorage flag)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarCheck, Star, ArrowRight, X } from 'lucide-react';

const STEPS = [
  {
    emoji: '🔍',
    Icon: Search,
    title: 'Service Dhundo',
    desc: 'Plumber, electrician, cleaner — jo chahiye search karo ya categories mein dekho.',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    emoji: '📅',
    Icon: CalendarCheck,
    title: 'Book Karo',
    desc: 'Worker chunno, time set karo, aur booking confirm karo — 60 seconds mein!',
    color: 'from-primary-400 to-orange-500',
  },
  {
    emoji: '⭐',
    Icon: Star,
    title: 'Rate Karo',
    desc: 'Kaam hone ke baad worker ko rate karo aur apna feedback do.',
    color: 'from-yellow-400 to-orange-400',
  },
];

const TOUR_KEY = 'seva_tour_done';

export const FirstTimeTour = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      // Small delay so home screen loads first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = () => {
    localStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-sm"
            onClick={handleDone}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 px-4 pb-8"
          >
            <div className="bg-white dark:bg-ink-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient top strip */}
              <div className={`h-1.5 bg-gradient-to-r ${current.color}`} />

              <div className="p-6">
                {/* Skip */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-ink-200 dark:bg-ink-600'
                        }`}
                      />
                    ))}
                  </div>
                  <button onClick={handleDone} className="text-ink-400 hover:text-ink-600 transition">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-5 shadow-md`}>
                  <current.Icon size={28} className="text-white" strokeWidth={2} />
                </div>

                {/* Text */}
                <h2 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50 mb-2">
                  {current.title}
                </h2>
                <p className="text-sm text-ink-500 dark:text-cream-100/60 leading-relaxed mb-6">
                  {current.desc}
                </p>

                {/* CTA */}
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 rounded-2xl py-4 font-semibold text-sm"
                >
                  {step < STEPS.length - 1 ? (
                    <>Aage <ArrowRight size={16} strokeWidth={2.5} /></>
                  ) : (
                    <>Chalo Shuru Karte Hain! 🚀</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
