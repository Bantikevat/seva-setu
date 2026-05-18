/**
 * WORKER SCHEDULE SCREEN
 * Route: /worker-schedule
 * Worker sets which days + hours they work
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { workerSelf } from '@/services/api';

type DaySlot = { active: boolean; start: string; end: string };
type Schedule = Record<string, DaySlot>;

const DAYS = [
  { key: 'mon', label: 'Monday',    labelHi: 'Somwar' },
  { key: 'tue', label: 'Tuesday',   labelHi: 'Mangalwar' },
  { key: 'wed', label: 'Wednesday', labelHi: 'Budhwar' },
  { key: 'thu', label: 'Thursday',  labelHi: 'Guruwar' },
  { key: 'fri', label: 'Friday',    labelHi: 'Shukrawar' },
  { key: 'sat', label: 'Saturday',  labelHi: 'Shaniwar' },
  { key: 'sun', label: 'Sunday',    labelHi: 'Itwaar' },
];

const DEFAULT: Schedule = {
  mon: { active: true,  start: '09:00', end: '18:00' },
  tue: { active: true,  start: '09:00', end: '18:00' },
  wed: { active: true,  start: '09:00', end: '18:00' },
  thu: { active: true,  start: '09:00', end: '18:00' },
  fri: { active: true,  start: '09:00', end: '18:00' },
  sat: { active: false, start: '10:00', end: '14:00' },
  sun: { active: false, start: '10:00', end: '14:00' },
};

export const WorkerScheduleScreen = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    workerSelf.getSchedule()
      .then((res) => { if (res.data?.schedule) setSchedule(res.data.schedule); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) =>
    setSchedule((s) => ({ ...s, [key]: { ...s[key], active: !s[key].active } }));

  const setTime = (key: string, field: 'start' | 'end', value: string) =>
    setSchedule((s) => ({ ...s, [key]: { ...s[key], [field]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await workerSelf.updateSchedule(schedule);
      toast.success('Schedule save ho gaya! ✅');
      navigate('/worker-mode');
    } catch {
      toast.error('Save nahi hua, dobara try karo');
    } finally {
      setSaving(false);
    }
  };

  const activeDays = DAYS.filter((d) => schedule[d.key]?.active).length;

  if (loading) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 p-4 pt-14 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-20" />)}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 pt-12 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/worker-mode')}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/25 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] tracking-widest uppercase opacity-70 font-bold">Worker</p>
            <h1 className="text-xl font-extrabold">Kaam ka Schedule</h1>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 flex items-center gap-4">
          <Clock size={28} className="opacity-80" />
          <div>
            <p className="font-bold text-lg">{activeDays} din active</p>
            <p className="text-xs opacity-70">Customers yahi dekhenge — kab available ho</p>
          </div>
        </div>
      </div>

      {/* Day rows */}
      <div className="px-4 pt-5 space-y-3">
        {DAYS.map((day, i) => {
          const slot = schedule[day.key];
          return (
            <motion.div
              key={day.key}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-zinc-900 border-2 rounded-2xl p-4 transition-all ${
                slot.active
                  ? 'border-indigo-300 dark:border-indigo-700'
                  : 'border-slate-100 dark:border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-extrabold text-sm">{day.label}</p>
                  <p className="text-[10px] text-slate-500">{day.labelHi}</p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(day.key)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    slot.active ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      slot.active ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Time pickers — only if active */}
              {slot.active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Shuru</p>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => setTime(day.key, 'start', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-slate-400 font-bold mt-4">→</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Band</p>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => setTime(day.key, 'end', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}

              {!slot.active && (
                <p className="text-xs text-slate-400 italic">Yeh din band hai</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick presets */}
      <div className="px-4 pt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Set</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Mon–Fri (9–6)',  fn: () => setSchedule({ mon: { active: true,  start: '09:00', end: '18:00' }, tue: { active: true,  start: '09:00', end: '18:00' }, wed: { active: true,  start: '09:00', end: '18:00' }, thu: { active: true,  start: '09:00', end: '18:00' }, fri: { active: true,  start: '09:00', end: '18:00' }, sat: { active: false, start: '10:00', end: '14:00' }, sun: { active: false, start: '10:00', end: '14:00' } }) },
            { label: 'Roz (8–8)',      fn: () => setSchedule(Object.fromEntries(DAYS.map((d) => [d.key, { active: true, start: '08:00', end: '20:00' }]))) },
            { label: 'Mon–Sat (9–6)',  fn: () => setSchedule({ mon: { active: true,  start: '09:00', end: '18:00' }, tue: { active: true,  start: '09:00', end: '18:00' }, wed: { active: true,  start: '09:00', end: '18:00' }, thu: { active: true,  start: '09:00', end: '18:00' }, fri: { active: true,  start: '09:00', end: '18:00' }, sat: { active: true,  start: '09:00', end: '15:00' }, sun: { active: false, start: '10:00', end: '14:00' } }) },
            { label: 'Reset',          fn: () => setSchedule(DEFAULT) },
          ].map((p) => (
            <button
              key={p.label}
              onClick={p.fn}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-zinc-800">
        <Button
          fullWidth
          size="lg"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save size={18} />}
        >
          Schedule Save Karo
        </Button>
      </div>
    </div>
  );
};
