/**
 * WORKER DASHBOARD â€” Worker view of the app
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, Clock, CheckCircle, DollarSign,
  Briefcase, Star, Phone, MapPin, Calendar, CalendarDays,
  Award, Images,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LocationShareButton } from '@/components/ui/LocationShareButton';
import { workerStats, workerJobs, getErrorMessage } from '@/services/api';
import { downloadWorkerCertificate } from '@/utils/worker-certificate';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types';
import { logger } from '@/utils/logger';

export const WorkerDashboardScreen = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [earnings, setEarnings] = useState<any>(null);
  const [pendingJobs, setPendingJobs] = useState<Booking[]>([]);
  const [activeJobs, setActiveJobs]   = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [earnRes, pendRes, actRes] = await Promise.all([
        workerStats.earnings().catch(() => null),
        workerJobs.list('pending').catch(() => null),
        Promise.all([
          workerJobs.list('confirmed').catch(() => null),
          workerJobs.list('on_the_way').catch(() => null),
          workerJobs.list('in_progress').catch(() => null),
        ]),
      ]);

      if (earnRes?.data) setEarnings(earnRes.data);
      if (pendRes?.data) setPendingJobs(pendRes.data.bookings);

      const active: Booking[] = [];
      actRes.forEach((r) => { if (r?.data) active.push(...r.data.bookings); });
      setActiveJobs(active);
    } catch (err) {
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await workerJobs.accept(id);
      toast.success('Job accepted!');
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject yeh job?')) return;
    try {
      await workerJobs.reject(id);
      toast.success('Job rejected');
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleStart = async (id: string) => {
    try {
      await workerJobs.start(id);
      toast.success('Customer ko bata diya');
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleArrived = async (id: string) => {
    try {
      await workerJobs.arrived(id);
      toast.success('Kaam shuru!');
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Job complete?')) return;
    try {
      await workerJobs.complete(id);
      toast.success('Kaam complete! Payment ready ðŸ’°');
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 pt-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/25 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs opacity-80">WORKER MODE</p>
            <h2 className="text-lg font-extrabold">My Dashboard</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Earnings card */}
        <button
          onClick={() => navigate('/worker-earnings')}
          className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs opacity-80">ðŸ’° Total Earnings</p>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold opacity-80">
              Detail Dekho â†’
            </span>
          </div>
          <p className="text-3xl font-extrabold mb-3">
            â‚¹{earnings?.totalEarned || 0}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs opacity-80">Pending</p>
              <p className="font-bold">â‚¹{earnings?.pendingPayout || 0}</p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-xs opacity-80">Jobs</p>
              <p className="font-bold">{earnings?.totalJobs || 0}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Paid Out</p>
              <p className="font-bold">â‚¹{earnings?.paidOut || 0}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="px-4 pt-4">
        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => navigate('/worker-earnings')}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 flex items-center gap-2"
          >
            <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Earnings</span>
          </button>
          <button
            onClick={() => navigate('/worker-schedule')}
            className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-3 flex items-center gap-2"
          >
            <CalendarDays size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Schedule</span>
          </button>
          <button
            onClick={() => navigate('/worker-gallery')}
            className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-3 flex items-center gap-2"
          >
            <Images size={18} className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-400">My Gallery</span>
          </button>
          <button
            onClick={() => {
              if (currentUser) {
                downloadWorkerCertificate({
                  name: currentUser.name || 'Worker',
                  rating: earnings?.rating,
                  totalJobs: earnings?.totalJobs || currentUser.totalJobs,
                  joinedAt: currentUser.createdAt,
                });
                toast.success('Certificate download ho raha hai!');
              }
            }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3 flex items-center gap-2"
          >
            <Award size={18} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">Certificate</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-1">
        {/* Pending Jobs (Needs Action) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" />
              New Requests
            </h3>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-bold">
              {pendingJobs.length} pending
            </span>
          </div>

          {loading ? (
            <div className="skeleton h-32" />
          ) : pendingJobs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-zinc-700">
              No new requests
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-zinc-900 border-2 border-yellow-300 dark:border-yellow-900 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{b.categoryEmoji}</span>
                      <div>
                        <p className="font-bold text-sm">{b.categoryName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{b.bookingNumber}</p>
                      </div>
                    </div>
                    <p className="text-lg font-extrabold text-emerald-500">â‚¹{b.workerPayout}</p>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <p className="flex items-center gap-1"><Calendar size={11} />
                      {new Date(b.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-center gap-1"><MapPin size={11} /> {b.fullAddress}</p>
                    {b.notes && <p className="italic">"{b.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" fullWidth onClick={() => handleReject(b.id)}>
                      Reject
                    </Button>
                    <Button size="sm" fullWidth onClick={() => handleAccept(b.id)}>
                      Accept
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs */}
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Briefcase size={18} className="text-blue-500" />
            Active Jobs
          </h3>

          {activeJobs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-zinc-700">
              No active jobs
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((b) => {
                const nextAction =
                  b.status === 'confirmed'  ? { label: 'On The Way', handler: () => handleStart(b.id) } :
                  b.status === 'on_the_way' ? { label: 'Arrived', handler: () => handleArrived(b.id) } :
                  b.status === 'in_progress'? { label: 'Complete Job', handler: () => handleComplete(b.id) } :
                  null;

                return (
                  <div key={b.id} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{b.categoryEmoji}</span>
                        <div>
                          <p className="font-bold text-sm">{b.categoryName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{b.bookingNumber}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <p className="flex items-center gap-1"><MapPin size={11} /> {b.fullAddress}</p>
                      <p>ðŸ’° Earning: <strong className="text-emerald-500">â‚¹{b.workerPayout}</strong></p>
                    </div>
                    {nextAction && (
                      <Button fullWidth size="sm" onClick={nextAction.handler}>
                        {nextAction.label}
                      </Button>
                    )}

                    {/* Live location sharing â€” only when going to / at customer */}
                    {(b.status === 'on_the_way' || b.status === 'in_progress') && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-center">
                        <LocationShareButton bookingId={b.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
