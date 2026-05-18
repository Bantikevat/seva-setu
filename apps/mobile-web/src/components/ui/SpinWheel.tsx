import { useState } from 'react';
import { Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIZES = ['5% OFF', '10% OFF', '₹50 OFF', 'Try Again', '15% OFF', '₹100 OFF', '20% OFF', '₹25 OFF'];
const COLORS = ['#FF6B35','#F7931E','#FFD700','#10B981','#3B82F6','#8B5CF6','#EC4899','#F43F5E'];

const KEY = 'seva_spin_last';

export const SpinWheel = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [used, setUsed]   = useState(localStorage.getItem(KEY) === today);
  const [rot, setRot]     = useState(0);
  const [spinning, setSp] = useState(false);

  const spin = () => {
    if (used || spinning) return;
    setSp(true);
    const slice = 360 / PRIZES.length;
    const idx   = Math.floor(Math.random() * PRIZES.length);
    const final = 360 * 5 + (360 - idx * slice - slice / 2);
    setRot(final);
    setTimeout(() => {
      setSp(false);
      setUsed(true);
      localStorage.setItem(KEY, today);
      toast.success(`You won: ${PRIZES[idx]}!`, { icon: '🎁', duration: 4000 });
    }, 3000);
  };

  return (
    <div className="mx-4 my-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Gift size={16} className="text-primary-500" />
        <p className="text-sm font-bold">Daily Spin · Free Reward</p>
      </div>

      <div className="relative w-40 h-40 mx-auto mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-[3000ms] ease-out" style={{ transform: `rotate(${rot}deg)` }}>
          {PRIZES.map((p, i) => {
            const angle = (360 / PRIZES.length) * i;
            const next  = angle + 360 / PRIZES.length;
            const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 50 + 50 * Math.cos((next  - 90) * Math.PI / 180);
            const y2 = 50 + 50 * Math.sin((next  - 90) * Math.PI / 180);
            const mid = angle + (360 / PRIZES.length) / 2;
            const tx  = 50 + 30 * Math.cos((mid - 90) * Math.PI / 180);
            const ty  = 50 + 30 * Math.sin((mid - 90) * Math.PI / 180);
            return (
              <g key={i}>
                <path d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`} fill={COLORS[i % COLORS.length]} />
                <text x={tx} y={ty} fontSize="5" fill="white" textAnchor="middle" fontWeight="700" transform={`rotate(${mid} ${tx} ${ty})`}>{p}</text>
              </g>
            );
          })}
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[12px] border-t-red-600" />
      </div>

      <button
        onClick={spin}
        disabled={used || spinning}
        className="bg-primary-500 text-white text-sm font-bold px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {used ? 'Kal phir try karo' : spinning ? 'Spinning...' : 'SPIN!'}
      </button>
    </div>
  );
};
