/**
 * SPLASH — Sophisticated luxury (Cred-inspired)
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [taps, setTaps] = useState(0);
  const tapTimerRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(token ? '/home' : '/onboard', { replace: true });
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, token]);

  const handleLogoTap = () => {
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (newTaps >= 5) {
      toast.success('Admin unlocked');
      navigate('/admin');
      return;
    }
    if (newTaps >= 3) toast(`${5 - newTaps} more taps`);
    tapTimerRef.current = setTimeout(() => setTaps(0), 3000);
  };

  return (
    <div className="w-full h-full bg-ink-900 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Subtle warm glow — one corner only */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl" />

      {/* Center content */}
      <div className="relative z-10 text-center px-8">
        {/* Minimal logo */}
        <motion.button
          onClick={handleLogoTap}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="block mx-auto mb-12 group"
        >
          <div className="w-20 h-20 border border-cream-100/20 rounded-2xl flex items-center justify-center mx-auto relative">
            <div className="w-12 h-12 bg-gradient-gold rounded-lg shadow-medium" />
          </div>
        </motion.button>

        {/* Wordmark — Cred-style minimal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-[44px] font-medium text-cream-50 tracking-[-0.03em] leading-none mb-3">
            Seva Setu
          </h1>
          <p className="font-hindi text-base text-cream-100/50 font-medium">
            सेवा सेतु
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-[11px] tracking-[0.3em] uppercase text-cream-100/30 mt-8 font-medium"
        >
          Premium Home Services
        </motion.p>
      </div>

      {/* Bottom signature */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-0 right-0 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] uppercase text-cream-100/25 font-medium">
          <span>est.</span>
          <span className="text-gold">2026</span>
          <span className="w-px h-3 bg-cream-100/20" />
          <span>India</span>
        </div>
      </motion.div>

      {/* Loading indicator — minimal */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1, duration: 1.6, ease: 'easeInOut' }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-px bg-cream-100/30 origin-left"
      />
    </div>
  );
};
