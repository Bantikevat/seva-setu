/**
 * ONBOARDING SCREEN
 * -------------------------------------------------
 * 3-slide intro with smooth transitions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const slides = [
  {
    emoji: '🔧',
    title: 'Verified\nProfessionals',
    desc: 'Background verified workers\naapke ghar par 60 min mein',
    gradient: 'bg-gradient-sunset',
    floatingIcons: ['⭐', '✓', '💯'],
  },
  {
    emoji: '💳',
    title: 'Transparent\nPricing',
    desc: 'Koi hidden charges nahi\nSirf UPI se secure payment',
    gradient: 'bg-gradient-ocean',
    floatingIcons: ['₹', '🔒', '✓'],
  },
  {
    emoji: '🎯',
    title: 'Premium\nQuality',
    desc: 'Work guarantee with\nquality assurance',
    gradient: 'bg-gradient-mint',
    floatingIcons: ['🛡️', '💎', '🏆'],
  },
];

export const OnboardScreen = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate('/login');
    }
  };

  const slide = slides[current];

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={() => navigate('/login')}
          className="text-slate-600 dark:text-slate-400 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 px-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="text-center w-full"
          >
            {/* Illustration */}
            <div className="relative w-56 h-56 mx-auto mb-10">
              <div className={`absolute inset-0 ${slide.gradient} opacity-15 rounded-full animate-spin-slow`} />

              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] z-10"
              >
                {slide.emoji}
              </motion.span>

              {/* Floating icons */}
              {slide.floatingIcons.map((icon, i) => {
                const positions = [
                  'top-[10%] right-0',
                  'bottom-[20%] -left-2',
                  'top-1/2 -right-5',
                ];
                return (
                  <motion.div
                    key={icon}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                    className={`absolute ${positions[i]} w-11 h-11 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl shadow-premium`}
                  >
                    {icon}
                  </motion.div>
                );
              })}
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-4 whitespace-pre-line">
              {slide.title}
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {slide.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-primary-500' : 'w-2 bg-slate-300 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* Action */}
      <div className="px-8 pb-8">
        <Button
          onClick={handleNext}
          fullWidth
          size="lg"
          rightIcon={<ArrowRight size={20} />}
        >
          {current === slides.length - 1 ? "Let's Start" : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
