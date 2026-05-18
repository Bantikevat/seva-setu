import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'seva_cookie_consent';

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setShow(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9998] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 animate-slide-up">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
          <Cookie size={20} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Cookies use karte hain</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Better experience ke liye hum cookies use karte hain. <Link to="/privacy" className="text-primary-500 underline">Privacy policy</Link> padho.
          </p>
        </div>
        <button onClick={reject} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={reject}
          className="flex-1 text-xs font-semibold py-2 px-3 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
        >
          Sirf zaroori
        </button>
        <button
          onClick={accept}
          className="flex-1 text-xs font-semibold py-2 px-3 rounded-full bg-primary-500 text-white hover:bg-primary-600"
        >
          Sab accept karo
        </button>
      </div>
    </div>
  );
};
