/**
 * LOGIN — Editorial premium
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import { auth, getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { LangToggle } from '@/components/ui/LangToggle';
import { useT } from '@/i18n/useT';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const setPhone = useAuthStore((s) => s.setPhone);
  const t = useT();

  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    if (!/^\d{10}$/.test(phoneInput)) { setError(t('login.phoneErr10')); return; }
    if (!/^[6-9]/.test(phoneInput)) { setError(t('login.phoneErrIndia')); return; }

    setLoading(true);
    try {
      await auth.sendOtp(phoneInput);
      setPhone(phoneInput);
      toast.success(t('login.otpSent'));
      navigate('/otp');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto">
      {/* Top bar — lang toggle */}
      <div className="px-6 pt-12 pb-0 flex justify-end">
        <LangToggle variant="inline" />
      </div>

      {/* Brand */}
      <div className="px-6 pt-4 pb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-1">{t('login.welcomeTo')}</p>
          <h1 className="font-display text-4xl tracking-tight text-ink-900 dark:text-cream-50 font-medium">Seva Setu</h1>
          <p className="font-hindi text-base text-ink-400 mt-1">सेवा सेतु</p>
        </motion.div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <h2 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-3 font-medium">
            {t('login.tagline1')}<br />
            <span className="italic font-normal text-primary-500">{t('login.tagline2')}</span>
          </h2>
          <p className="text-sm text-ink-400 dark:text-cream-100/50 mt-3 max-w-xs">
            {t('login.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Phone Input */}
      <div className="px-6 mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">{t('login.mobile')}</p>

        <div className={`flex items-center bg-white dark:bg-ink-800 border-2 rounded-2xl overflow-hidden transition-all ${
          error ? 'border-red-500' : phoneInput ? 'border-primary-500' : 'border-ink-100 dark:border-ink-700'
        }`}>
          <div className="flex items-center gap-2 px-5 py-4 border-r-2 border-ink-100 dark:border-ink-700">
            <span className="text-lg">🇮🇳</span>
            <span className="font-medium text-ink-700 dark:text-cream-100">+91</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            className="flex-1 px-5 py-4 bg-transparent outline-none text-base font-medium tracking-wider text-ink-900 dark:text-cream-50"
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-xs font-medium mt-2">{error}</p>}
      </div>

      {/* CTA */}
      <div className="px-6 mb-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
          ) : (
            <>{t('common.continue')}<ArrowUpRight size={16} strokeWidth={2.5} /></>
          )}
        </motion.button>
      </div>

      {/* Trust */}
      <div className="px-6 mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">{t('login.why')}</p>

        <div className="space-y-px">
          {[
            { Icon: BadgeCheck, label: t('login.verified'), desc: t('login.verifiedDesc') },
            { Icon: Zap,        label: t('login.fast'),     desc: t('login.fastDesc') },
            { Icon: ShieldCheck, label: t('login.secure'),  desc: t('login.secureDesc') },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="py-5 border-t border-ink-100 dark:border-ink-700 flex items-start gap-4 last:border-b"
            >
              <item.Icon size={18} strokeWidth={1.5} className="text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink-900 dark:text-cream-50">{item.label}</p>
                <p className="text-xs text-ink-400 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div className="px-6 pb-10 text-center">
        <p className="text-[10px] text-ink-400 leading-relaxed">
          {t('login.legal')}{' '}
          <button onClick={() => navigate('/terms')} className="text-primary-500 font-medium underline">{t('login.terms')}</button>
          {' '}{t('login.and')}{' '}
          <button onClick={() => navigate('/privacy')} className="text-primary-500 font-medium underline">{t('login.privacy')}</button>
        </p>
      </div>
    </div>
  );
};
