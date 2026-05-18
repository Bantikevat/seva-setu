import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export const NotFoundScreen = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="text-[120px] font-black text-primary-500 leading-none">404</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-2">Page nahi mila</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-8 max-w-xs">
        Jo page tum dhoond rahe ho woh exist nahi karta ya hata diya gaya hai.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => nav('/home')}
          className="flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-full font-semibold hover:bg-primary-600 transition"
        >
          <Home size={18} /> Home
        </button>
        <button
          onClick={() => nav('/search')}
          className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 px-5 py-3 rounded-full font-semibold hover:bg-slate-50 transition"
        >
          <Search size={18} /> Search
        </button>
      </div>
    </div>
  );
};
