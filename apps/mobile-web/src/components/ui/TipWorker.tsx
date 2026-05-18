import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const TIP_AMOUNTS = [10, 20, 50, 100];

export const TipWorker = ({ workerName, onTip }: { workerName: string; onTip?: (amount: number) => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone]         = useState(false);

  const handleTip = (amount: number) => {
    setSelected(amount);
    setTimeout(() => {
      setDone(true);
      onTip?.(amount);
      toast.success(`₹${amount} tip ${workerName} ko bhej diya!`, { icon: '💝' });
    }, 400);
  };

  if (done) {
    return (
      <div className="mx-4 my-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-2xl p-4 text-center">
        <Sparkles size={20} className="text-pink-500 mx-auto mb-1" />
        <p className="text-sm font-bold text-pink-700 dark:text-pink-300">
          Thank you! Tip {workerName} ko milegi
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 my-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={16} className="text-pink-500" />
        <p className="text-sm font-bold">{workerName} ko tip do (optional)</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {TIP_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => handleTip(amt)}
            className={`py-2.5 rounded-xl text-sm font-bold transition ${
              selected === amt
                ? 'bg-pink-500 text-white scale-95'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-pink-950'
            }`}
          >
            ₹{amt}
          </button>
        ))}
      </div>
    </div>
  );
};
