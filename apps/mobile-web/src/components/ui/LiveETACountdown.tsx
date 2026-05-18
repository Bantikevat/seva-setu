import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveETACountdown = ({ scheduledAt }: { scheduledAt: string }) => {
  const calcDiff = () => Math.floor((new Date(scheduledAt).getTime() - Date.now()) / 60_000);
  const [mins, setMins] = useState<number>(calcDiff());

  useEffect(() => {
    const id = setInterval(() => setMins(calcDiff()), 60_000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  if (mins < -60) return null; // very old booking

  const arrived = mins <= 0 && mins > -60;
  const display = arrived
    ? 'Worker pahunch gaya / pahunch raha hai'
    : mins < 60
      ? `${mins} minute mein pahunchega`
      : `${Math.floor(mins / 60)}h ${mins % 60}m mein pahunchega`;

  return (
    <div className={`mx-4 my-3 rounded-2xl p-4 flex items-center gap-3 ${
      arrived
        ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
        : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        arrived ? 'bg-green-500' : 'bg-blue-500'
      } text-white`}>
        <Clock size={18} className={arrived ? '' : 'animate-pulse'} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live ETA</p>
        <p className={`text-sm font-bold ${arrived ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
          {display}
        </p>
      </div>
    </div>
  );
};
