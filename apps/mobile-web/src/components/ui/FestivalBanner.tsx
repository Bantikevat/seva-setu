import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { getCurrentFestival } from '@/utils/festival';

const DISMISS_KEY = 'seva_festival_dismissed';

export const FestivalBanner = () => {
  const [festival, setFestival] = useState(getCurrentFestival());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    if (localStorage.getItem(DISMISS_KEY) === today) setDismissed(true);
  }, []);

  if (!festival || dismissed) return null;

  const close = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toDateString());
    setDismissed(true);
  };

  return (
    <div className={`mx-4 my-3 bg-gradient-to-r ${festival.color} text-white rounded-2xl p-3 flex items-center gap-3 shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 text-7xl opacity-20">{festival.emoji}</div>
      <div className="text-3xl">{festival.emoji}</div>
      <div className="flex-1">
        <p className="font-bold text-sm flex items-center gap-1">
          <Sparkles size={14} /> Happy {festival.name}!
        </p>
        <p className="text-xs opacity-90">{festival.offer}</p>
      </div>
      <button onClick={close} className="p-1 hover:bg-white/20 rounded-full"><X size={16} /></button>
    </div>
  );
};
