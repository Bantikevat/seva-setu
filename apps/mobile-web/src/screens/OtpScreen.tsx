/**
 * OTP — Editorial premium
 */

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { auth, user as userApi, getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { successBurst } from '@/utils/confetti';
import { registerPush } from '@/utils/fcm';
import { LangToggle } from '@/components/ui/LangToggle';
import { useT } from '@/i18n/useT';

export const OtpScreen = () => {
  const navigate = useNavigate();
  const { phone, setUser, setToken } = useAuthStore();
  const t = useT();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!phone) return <Navigate to="/login" replace />;

  useEffect(() => { setTimeout(() => inputRefs.current[0]?.focus(), 300); }, []);

  // Auto-fill OTP from clipboard (if 6 digits)
  useEffect(() => {
    const tryClipboard = async () => {
      try {
        if (!navigator.clipboard?.readText) return;
        const text = await navigator.clipboard.readText();
        const match = text.trim().match(/\b(\d{6})\b/);
        if (match && otp.every((c) => !c)) {
          const digits = match[1].split('');
          setOtp(digits);
          handleVerify(match[1]);
        }
      } catch {}
    };
    const onFocus = () => tryClipboard();
    window.addEventListener('focus', onFocus);
    setTimeout(tryClipboard, 600);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // WebOTP API — Chrome auto-reads SMS on Android
  useEffect(() => {
    const ac = new AbortController();
    const otpCred = (navigator as unknown as { credentials?: { get?: (o: object) => Promise<{ code?: string } | null> } }).credentials;
    if (otpCred?.get && 'OTPCredential' in window) {
      otpCred.get({ otp: { transport: ['sms'] }, signal: ac.signal })
        .then((c) => { if (c?.code && c.code.length === 6) { setOtp(c.code.split('')); handleVerify(c.code); } })
        .catch(() => {});
    }
    return () => ac.abort();
  }, []);
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    if (cleaned && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((c) => c.length === 1)) handleVerify(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''));
    setOtp(newOtp);
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (code?: string) => {
    const finalOtp = code || otp.join('');
    setError('');
    if (finalOtp.length !== 6) { setError(t('otp.errLength')); return; }

    setLoading(true);
    try {
      const result = await auth.verifyOtp(phone, finalOtp);
      if (result.data) {
        setToken(result.data.token);
        setUser(result.data.user);
        localStorage.setItem('seva_token', result.data.token);
        successBurst();
        toast.success(t('common.welcome'));
        // Apply referral code if entered (fire-and-forget)
        if (referralCode.trim()) {
          userApi.applyReferral(referralCode.trim().toUpperCase())
            .then(() => toast.success('🎁 Referral code applied! 100 bonus points mile!'))
            .catch(() => toast.error('Referral code invalid ya already used'));
        }
        // Register for push notifications (fire-and-forget — won't block login)
        registerPush(result.data.user.id, 'user').catch(() => {});
        setTimeout(() => navigate('/home', { replace: true }), 800);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await auth.sendOtp(phone);
      toast.success(t('otp.resent'));
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto">
      {/* MINIMAL HEADER */}
      <div className="px-6 pt-12 pb-3 flex items-center justify-between">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/login')} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
          <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
        </motion.button>
        <LangToggle variant="inline" />
      </div>

      {/* HERO */}
      <div className="px-6 pt-8 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
            {t('otp.verification')}
          </p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-3 font-medium">
            {t('otp.enter')}<br />
            <span className="italic font-normal text-primary-500">{t('otp.code')}</span>
          </h1>
          <p className="text-sm text-ink-400 dark:text-cream-100/50">
            {t('otp.sentTo')} <strong className="text-ink-900 dark:text-cream-100 font-medium">+91 {phone}</strong>
          </p>
        </motion.div>
      </div>

      {/* OTP INPUTS */}
      <div className="px-6 mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-4">
          {t('otp.label')}
        </p>

        <div className="flex gap-2 justify-between">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`flex-1 aspect-square text-center text-2xl font-display font-medium rounded-2xl border-2 outline-none transition-all ${
                digit
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600'
                  : 'border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-cream-50'
              } focus:border-primary-500 focus:scale-105`}
            />
          ))}
        </div>

        {error && (
          <motion.p initial={{ x: -5 }} animate={{ x: [0, -5, 5, -5, 5, 0] }} className="text-red-500 text-sm font-medium mt-4 text-center">
            {error}
          </motion.p>
        )}
      </div>

      {/* REFERRAL CODE */}
      <div className="px-6 mb-5">
        <button
          onClick={() => setShowReferral(!showReferral)}
          className="text-xs text-ink-400 underline underline-offset-2"
        >
          🎁 Kya kisi ne refer kiya? Referral code daalo
        </button>
        {showReferral && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Jaise: SEVA12345AB"
              className="w-full p-3 bg-white dark:bg-ink-800 border-2 border-ink-100 dark:border-ink-700 rounded-2xl text-sm font-mono font-medium outline-none focus:border-primary-500 placeholder:text-ink-300 dark:placeholder:text-ink-500 text-ink-900 dark:text-cream-50 uppercase tracking-widest"
            />
            <p className="text-[10px] text-ink-400 mt-1.5 text-center">
              Login hone ke baad 100 bonus points milenge
            </p>
          </motion.div>
        )}
      </div>

      {/* DEV HINT */}
      <div className="px-6 mb-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-amber-700 dark:text-amber-400 font-medium mb-1">
            {t('otp.devMode')}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t('otp.devHint')}
          </p>
        </div>
      </div>

      {/* VERIFY BUTTON */}
      <div className="px-6 mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleVerify()}
          disabled={loading}
          className="w-full bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
          ) : (
            <>{t('otp.verify')}<ArrowUpRight size={16} strokeWidth={2.5} /></>
          )}
        </motion.button>
      </div>

      {/* RESEND */}
      <div className="px-6 text-center">
        {timer > 0 ? (
          <p className="text-xs text-ink-400">
            {t('otp.resendIn')} <strong className="text-ink-900 dark:text-cream-100 font-mono">{timer}s</strong>
          </p>
        ) : (
          <button onClick={handleResend} className="text-xs font-medium text-primary-500 underline">
            {t('otp.resend')}
          </button>
        )}
      </div>
    </div>
  );
};
