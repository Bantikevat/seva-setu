/**
 * APP — Main app component
 * -------------------------------------------------
 * Wraps everything: router + toaster + phone frame
 */

import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import { router } from '@/router';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkIndicator } from '@/components/ui/NetworkIndicator';
import { onForegroundMessage, initFcm } from '@/utils/fcm';
import { useAuthStore } from '@/store/auth.store';

function App() {
  // Foreground push handler — show toast when app is open
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    initFcm().then(() => {
      unsubscribe = onForegroundMessage((payload) => {
        const title = payload?.notification?.title || 'Seva Setu';
        const body  = payload?.notification?.body  || '';
        toast(`${title}\n${body}`, { duration: 4000, icon: '🔔' });
      });
    });
    return () => unsubscribe?.();
  }, []);

  // Auto dark mode — sunset to sunrise (if user hasn't manually set)
  const getAutoTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('seva_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const h = new Date().getHours();
    return (h >= 19 || h < 6) ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState<'light' | 'dark'>(getAutoTheme);

  // Apply theme to html
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  // Multi-tab logout sync
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('seva_auth');
    bc.onmessage = (e) => {
      if (e.data?.type === 'logout') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    };
    return () => bc.close();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('seva_theme', next);
  };

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <NetworkIndicator />
      {/* Theme toggle (outside phone) */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 w-12 h-12 rounded-2xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-card z-[9999] hover:scale-110 hover:rotate-12 transition-transform"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-500" />}
      </button>

      {/* Phone frame */}
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          <RouterProvider router={router} />
        </div>
      </div>

      {/* Info card (desktop only) */}
      <div className="hidden sm:block max-w-md bg-white dark:bg-zinc-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🚀</span>
          <h3 className="font-bold text-primary-500">Seva Setu — React Edition</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          React · TypeScript · Tailwind CSS · Framer Motion · Zustand
        </p>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Cookie Consent (GDPR) */}
      <CookieConsent />

      {/* WhatsApp Support */}
      <WhatsAppButton />

      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: theme === 'dark' ? '#1A1A1A' : '#0F172A',
            color: '#FFFFFF',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: '600',
            padding: '12px 20px',
          },
          success: { style: { background: '#10B981' } },
          error:   { style: { background: '#EF4444' } },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
