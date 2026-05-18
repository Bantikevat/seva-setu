/**
 * I18N STORE — Language preference (English / Hindi)
 * Persisted in localStorage so app remembers user's choice.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'hi';

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggle:  () => set({ lang: get().lang === 'en' ? 'hi' : 'en' }),
    }),
    { name: 'seva-lang' }
  )
);
