import { Clock, BadgeIndianRupee, Star, Zap } from 'lucide-react';

export type QuickFilter = 'open_now' | 'under_500' | 'top_rated' | 'fastest';

interface Props {
  active: QuickFilter | null;
  onChange: (filter: QuickFilter | null) => void;
}

const FILTERS = [
  { id: 'open_now'   as QuickFilter, icon: Clock,           label: 'Open Now',    color: 'green'  },
  { id: 'under_500'  as QuickFilter, icon: BadgeIndianRupee, label: '< ₹500',     color: 'blue'   },
  { id: 'top_rated'  as QuickFilter, icon: Star,            label: '4.5+',        color: 'amber'  },
  { id: 'fastest'    as QuickFilter, icon: Zap,             label: 'Fastest',     color: 'purple' },
];

export const QuickFilters = ({ active, onChange }: Props) => (
  <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
    {FILTERS.map(({ id, icon: Icon, label }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          onClick={() => onChange(isActive ? null : id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
            isActive
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:border-primary-500'
          }`}
        >
          <Icon size={13} /> {label}
        </button>
      );
    })}
  </div>
);
