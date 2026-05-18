/**
 * WORKER EARNINGS SCREEN
 * Route: /worker-earnings
 * Full earnings breakdown — monthly, weekly, per-job history
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { workerStats, workerJobs } from '@/services/api';
import type { Booking } from '@/types';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const getWeekRange = () => {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - now.getDay() + 1);
  mon.setHours(0, 0, 0, 0);
  return mon;
};

export const WorkerEarningsScreen = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<any>(null);
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      workerStats.earnings().catch(() => null),
      workerJobs.list('completed').catch(() => null),
    ]).then(([earnRes, jobsRes]) => {
      if (earnRes?.data) setEarnings(earnRes.data);
      if (jobsRes?.data?.bookings) setCompletedJobs(jobsRes.data.bookings);
    }).finally(() => setLoading(false));
  }, []);

  // Monthly breakdown from completed jobs
  const monthlyData = (() => {
    const map: Record<string, { month: string; jobs: number; earned: number }> = {};
    completedJobs.forEach((b) => {
      const d = new Date(b.scheduledAt || b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { month: label, jobs: 0, earned: 0 };
      map[key].jobs += 1;
      map[key].earned += b.workerPayout || 0;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).map(([, v]) => v);
  })();

  const maxMonthly = Math.max(...monthlyData.map((m) => m.earned), 1);

  // This week earnings
  const weekStart = getWeekRange();
  const thisWeekJobs = completedJobs.filter((b) => new Date(b.scheduledAt || b.createdAt) >= weekStart);
  const thisWeekEarned = thisWeekJobs.reduce((s, b) => s + (b.workerPayout || 0), 0);

  // This month
  const now = new Date();
  const thisMonthJobs = completedJobs.filter((b) => {
    const d = new Date(b.scheduledAt || b.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarned = thisMonthJobs.reduce((s, b) => s + (b.workerPayout || 0), 0);

  if (loading) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 p-4 pt-14 space-y-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 pt-12">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/worker-mode')}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/25 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] tracking-widest uppercase opacity-70 font-bold">Worker</p>
            <h1 className="text-xl font-extrabold">Meri Kamai</h1>
          </div>
        </div>

        {/* Big number */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-5 mb-4"
        >
          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Total Kamai</p>
          <p className="text-5xl font-extrabold mb-1">{fmt(earnings?.totalEarned || 0)}</p>
          <p className="text-xs opacity-70">{earnings?.totalJobs || 0} completed jobs</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Is Hafte',  value: fmt(thisWeekEarned),    jobs: thisWeekJobs.length },
            { label: 'Is Mahine', value: fmt(thisMonthEarned),   jobs: thisMonthJobs.length },
            { label: 'Pending',   value: fmt(earnings?.pendingPayout || 0), jobs: null },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-3 text-center">
              <p className="text-base font-extrabold">{s.value}</p>
              <p className="text-[9px] opacity-70 uppercase tracking-wider mt-0.5">{s.label}</p>
              {s.jobs !== null && (
                <p className="text-[9px] opacity-60 mt-0.5">{s.jobs} jobs</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Monthly bar chart */}
        {monthlyData.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-sm font-bold">Monthly Breakdown</p>
            </div>
            <div className="flex items-end gap-2 h-28">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {m.earned > 0 ? `₹${m.earned >= 1000 ? `${(m.earned / 1000).toFixed(1)}k` : m.earned}` : ''}
                  </p>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((m.earned / maxMonthly) * 80, 4)}px` }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${i === 0 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-900/40'}`}
                  />
                  <p className="text-[9px] text-slate-500 font-medium">{m.month}</p>
                  <p className="text-[8px] text-slate-400">{m.jobs}j</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Briefcase,    color: 'from-blue-400 to-indigo-500',   label: 'Total Jobs',   value: earnings?.totalJobs || 0 },
            { icon: DollarSign,   color: 'from-emerald-400 to-teal-500',  label: 'Total Kamai',  value: fmt(earnings?.totalEarned || 0) },
            { icon: Clock,        color: 'from-amber-400 to-orange-500',  label: 'Pending',      value: fmt(earnings?.pendingPayout || 0) },
            { icon: CheckCircle,  color: 'from-purple-400 to-pink-500',   label: 'Paid Out',     value: fmt(earnings?.paidOut || 0) },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 relative overflow-hidden`}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              <s.icon size={18} className="opacity-80 mb-2" />
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-[10px] opacity-80 uppercase tracking-wide font-semibold mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent completed jobs */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Completed Jobs</p>
          {completedJobs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
              Abhi tak koi job complete nahi hua
            </div>
          ) : (
            <div className="space-y-2">
              {completedJobs.slice(0, 20).map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                    {b.categoryEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{b.categoryName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{b.bookingNumber}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(b.scheduledAt || b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-500">{fmt(b.workerPayout || 0)}</p>
                    <p className="text-[9px] text-green-500 font-bold uppercase">Earned</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Payout info box */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4">
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-1">💰 Payout Policy</p>
          <ul className="text-xs text-emerald-600 dark:text-emerald-500 space-y-1">
            <li>• Har Shanivar weekly payout hota hai</li>
            <li>• 80% earning tumhara, 20% platform fee</li>
            <li>• UPI / Bank Transfer direct</li>
            <li>• ₹500 ka insurance coverage per job</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
