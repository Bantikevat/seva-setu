/**
 * useT — Translation hook
 *
 *   const t = useT();
 *   <h1>{t('login.welcomeTo')}</h1>
 *
 *   const { t, tCat, lang } = useTAll();
 *   <p>{tCat('AC Repair')}</p>
 */

import { useI18nStore } from '@/store/i18n.store';
import { translations, catKey, type TKey } from './translations';

export const useT = () => {
  const lang = useI18nStore((s) => s.lang);
  return (key: TKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  };
};

export const useTAll = () => {
  const lang = useI18nStore((s) => s.lang);
  const t = (key: TKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  };
  const tCat = (name: string): string => {
    const k = catKey(name);
    return k ? t(k) : name;
  };
  return { t, tCat, lang };
};
