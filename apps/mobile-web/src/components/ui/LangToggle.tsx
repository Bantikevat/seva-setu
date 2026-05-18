/**
 * LangToggle — EN / हिं pill switch
 * Drop anywhere. Persists via i18n store.
 */

import { motion } from 'framer-motion';
import { useI18nStore } from '@/store/i18n.store';

interface Props {
  variant?: 'pill' | 'inline';
  className?: string;
}

export const LangToggle = ({ variant = 'pill', className = '' }: Props) => {
  const { lang, setLang } = useI18nStore();

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center bg-cream-100 dark:bg-ink-800 rounded-full p-1 ${className}`}>
        <button
          onClick={() => setLang('en')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
            lang === 'en'
              ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
              : 'text-ink-500 dark:text-cream-100/60'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-4 py-1.5 rounded-full text-xs font-hindi font-medium transition ${
            lang === 'hi'
              ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
              : 'text-ink-500 dark:text-cream-100/60'
          }`}
        >
          हिं
        </button>
      </div>
    );
  }

  // Default pill — single tap toggles
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className={`h-10 px-4 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-cream-100 ${className}`}
      aria-label="Toggle language"
    >
      <span className="text-[10px] tracking-[0.2em] uppercase opacity-50">Lang</span>
      <span className={lang === 'hi' ? 'font-hindi' : ''}>
        {lang === 'en' ? 'EN' : 'हिं'}
      </span>
    </motion.button>
  );
};
