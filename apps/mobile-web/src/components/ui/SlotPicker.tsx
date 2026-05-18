/**
 * SLOT PICKER — Morning / Afternoon / Evening slots instead of bare datetime-local
 * Returns a full ISO datetime string
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, CloudSun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const SLOTS = [
  { id: 'morning',   label: 'Subah',    range: '7:00 – 11:00',  hour: 9,  Icon: Sun,      color: 'from-yellow-400 to-orange-400' },
  { id: 'afternoon', label: 'Dopahar',  range: '11:00 – 16:00', hour: 13, Icon: CloudSun, color: 'from-blue-400 to-sky-400' },
  { id: 'evening',   label: 'Shaam',    range: '16:00 – 20:00', hour: 17, Icon: Moon,     color: 'from-purple-400 to-indigo-500' },
];

const DAY_LABELS = ['Aaj', 'Kal', 'Parson'];

interface Props {
  value: string; // ISO datetime
  onChange: (iso: string) => void;
}

const toISO = (dayOffset: number, hour: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const parseSelected = (iso: string): { dayOffset: number; slotId: string } => {
  if (!iso) return { dayOffset: 0, slotId: 'morning' };
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((d.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / 86400000);
  const hour = new Date(iso).getHours();
  const slot = hour < 11 ? 'morning' : hour < 16 ? 'afternoon' : 'evening';
  return { dayOffset: Math.max(0, Math.min(diffDays, 2)), slotId: slot };
};

export const SlotPicker = ({ value, onChange }: Props) => {
  const parsed = parseSelected(value);
  const [dayOffset, setDayOffset] = useState(parsed.dayOffset);
  const [slotId, setSlotId] = useState(parsed.slotId);

  const select = (day: number, sid: string) => {
    setDayOffset(day);
    setSlotId(sid);
    const slot = SLOTS.find((s) => s.id === sid)!;
    onChange(toISO(day, slot.hour));
  };

  const dayLabel = (offset: number): string => {
    if (offset < DAY_LABELS.length) return DAY_LABELS[offset];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div>
      {/* Day selector */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => select(Math.max(0, dayOffset - 1), slotId)}
          disabled={dayOffset === 0}
          className="w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center disabled:opacity-30"
        >
          <ChevronLeft size={16} strokeWidth={2.5} className="text-ink-600 dark:text-cream-100" />
        </button>

        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
          {[0, 1, 2].map((offset) => (
            <button
              key={offset}
              type="button"
              onClick={() => select(offset, slotId)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                dayOffset === offset
                  ? 'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900'
                  : 'bg-cream-100 dark:bg-ink-800 text-ink-500 dark:text-cream-100/60 hover:bg-ink-100 dark:hover:bg-ink-700'
              }`}
            >
              {dayLabel(offset)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => select(Math.min(2, dayOffset + 1), slotId)}
          disabled={dayOffset === 2}
          className="w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center disabled:opacity-30"
        >
          <ChevronRight size={16} strokeWidth={2.5} className="text-ink-600 dark:text-cream-100" />
        </button>
      </div>

      {/* Slot cards */}
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((slot) => {
          const active = slotId === slot.id;
          return (
            <motion.button
              key={slot.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => select(dayOffset, slot.id)}
              className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 transition border-2 ${
                active
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-primary-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${slot.color} flex items-center justify-center`}>
                <slot.Icon size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <p className={`text-xs font-semibold ${active ? 'text-primary-600 dark:text-primary-400' : 'text-ink-700 dark:text-cream-100/80'}`}>
                {slot.label}
              </p>
              <p className={`text-[9px] leading-tight text-center ${active ? 'text-primary-500' : 'text-ink-400'}`}>
                {slot.range}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
