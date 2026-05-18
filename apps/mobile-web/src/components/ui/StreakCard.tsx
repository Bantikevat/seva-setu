import { useGamification, getLoyaltyTier } from '@/store/gamification.store';
import { Flame } from 'lucide-react';

export const StreakCard = () => {
  const { streakDays, totalBookings } = useGamification();
  const tier = getLoyaltyTier(totalBookings);

  if (streakDays === 0 && totalBookings === 0) return null;

  return (
    <div className="mx-4 my-3 flex gap-3">
      {streakDays > 0 && (
        <div className="flex-1 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] opacity-90 uppercase tracking-wider">Streak</p>
            <p className="text-lg font-bold leading-tight">{streakDays} days</p>
          </div>
        </div>
      )}
      <div className={`flex-1 bg-gradient-to-br ${tier.color} text-white rounded-2xl p-3 flex items-center gap-3`}>
        <div className="text-2xl">{tier.emoji}</div>
        <div>
          <p className="text-[10px] opacity-90 uppercase tracking-wider">Tier</p>
          <p className="text-lg font-bold leading-tight">{tier.name}</p>
          {tier.nextAt > 0 && (
            <p className="text-[9px] opacity-80">{tier.nextAt - totalBookings} more for next</p>
          )}
        </div>
      </div>
    </div>
  );
};
