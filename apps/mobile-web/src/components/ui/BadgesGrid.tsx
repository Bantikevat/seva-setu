import { useGamification, BADGE_META, type BadgeId } from '@/store/gamification.store';

export const BadgesGrid = () => {
  const { badges } = useGamification();
  const all = Object.keys(BADGE_META) as BadgeId[];

  return (
    <div className="mx-4 my-4">
      <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3 px-1">
        Achievements ({badges.length}/{all.length})
      </p>
      <div className="grid grid-cols-4 gap-2">
        {all.map((id) => {
          const m = BADGE_META[id];
          const unlocked = badges.includes(id);
          return (
            <div
              key={id}
              title={`${m.title}: ${m.desc}`}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-800/50 shadow-card'
                  : 'bg-slate-100 dark:bg-zinc-800 opacity-40 grayscale'
              }`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <p className="text-[8px] font-bold text-center leading-tight text-slate-700 dark:text-slate-300">
                {m.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
