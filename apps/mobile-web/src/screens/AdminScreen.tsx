/**
 * ADMIN PANEL â€” Comprehensive multi-tab dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Users, Briefcase, ClipboardList, CreditCard, Ticket,
  BarChart3, Lock, BadgeCheck, Ban, CheckCircle,
  DollarSign, TrendingUp, ShieldCheck,
} from 'lucide-react';
import { admin } from '@/services/api';

type Tab = 'dashboard' | 'users' | 'workers' | 'bookings' | 'payments' | 'coupons';

export const AdminScreen = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(admin.hasPassword());
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) return toast.error('Password required');
    admin.setPassword(password);
    try {
      await admin.dashboard();
      setAuthed(true);
      toast.success('Welcome, Admin!');
    } catch (err: unknown) {
      admin.logout();
      toast.error('Invalid password');
    }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    const loaders: Record<Tab, () => Promise<any>> = {
      dashboard: admin.dashboard,
      users:     admin.listUsers,
      workers:   admin.listWorkers,
      bookings:  () => admin.listBookings(),
      payments:  admin.listPayments,
      coupons:   admin.listCoupons,
    };

    loaders[tab]()
      .then((res) => setData(res.data || {}))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [tab, authed]);

  if (!authed) {
    return (
      <div className="w-full h-full bg-ink-900 flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-ink-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-medium">
              <Lock size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Admin Panel</h1>
            <p className="text-sm text-slate-400">Manage Seva Setu operations</p>
          </div>

          <div className="bg-ink-800 border border-ink-700 rounded-3xl p-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full p-4 bg-ink-900 border-2 border-ink-700 rounded-2xl text-white font-medium outline-none focus:border-primary-500"
              autoFocus
            />
            <button onClick={handleLogin} className="w-full mt-4 bg-ink-900 text-white font-bold py-4 rounded-2xl shadow-medium">
              Sign In â†’
            </button>

            <p className="text-[10px] text-slate-500 text-center mt-4">
              Hint: <code className="bg-ink-900 px-2 py-0.5 rounded">seva-admin-2026</code>
            </p>
          </div>

          <button onClick={() => navigate('/profile')} className="w-full mt-4 text-slate-400 text-sm hover:text-white">
            â† Back to app
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-ink-950 overflow-y-auto pb-10">
      <div className="bg-ink-900 text-white p-5 pt-12 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] tracking-widest uppercase opacity-60 font-bold">Seva Setu</p>
              <h2 className="text-lg font-extrabold">Admin Panel</h2>
            </div>
          </div>
          <button onClick={() => { admin.logout(); setAuthed(false); toast.success('Logged out'); }} className="text-xs text-slate-400 hover:text-white">
            Logout
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {([
            { key: 'dashboard', label: 'Stats',    icon: BarChart3 },
            { key: 'users',     label: 'Users',    icon: Users },
            { key: 'workers',   label: 'Workers',  icon: Briefcase },
            { key: 'bookings',  label: 'Bookings', icon: ClipboardList },
            { key: 'payments',  label: 'Payments', icon: CreditCard },
            { key: 'coupons',   label: 'Coupons',  icon: Ticket },
          ] as { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[]).map((t) => (
            <motion.button
              key={t.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                tab === t.key ? 'bg-primary-500 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : tab === 'dashboard' ? <DashboardTab data={data} />
          : tab === 'users'     ? <UsersTab data={data} />
          : tab === 'workers'   ? <WorkersTab data={data} reload={() => setTab(tab)} />
          : tab === 'bookings'  ? <BookingsTab data={data} />
          : tab === 'payments'  ? <PaymentsTab data={data} />
          : <CouponsTab data={data} reload={() => setTab(tab)} />}
      </div>
    </div>
  );
};

function DashboardTab({ data }: { data: Record<string, any> }) {
  if (!data.counts) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Revenue',  value: `â‚¹${data.revenue?.total || 0}`,  icon: DollarSign,   color: 'from-emerald-500 to-green-600' },
          { label: 'Platform Profit', value: `â‚¹${data.revenue?.profit || 0}`, icon: TrendingUp,   color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Users',    value: data.counts.users,                 icon: Users,        color: 'from-purple-500 to-pink-600' },
          { label: 'Workers',        value: data.counts.workers,               icon: Briefcase,    color: 'from-primary-500 to-orange-600' },
          { label: 'Bookings',       value: data.counts.bookings,              icon: ClipboardList, color: 'from-cyan-500 to-blue-600' },
          { label: 'Pending Verify', value: data.counts.pendingVerification,   icon: ShieldCheck,  color: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 relative overflow-hidden`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="relative">
              <s.icon size={18} className="opacity-80 mb-2" />
              <p className="text-2xl font-extrabold mb-0.5">{s.value}</p>
              <p className="text-[10px] opacity-80 uppercase tracking-wide font-semibold">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {data.statusCounts && (
        <div className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Booking Status</p>
          <div className="space-y-2">
            {Object.entries(data.statusCounts as Record<string, number>).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize font-medium">{status.replace(/_/g, ' ')}</span>
                <span className="font-bold text-primary-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topCategories?.length > 0 && (
        <div className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Services</p>
          <div className="space-y-2">
            {data.topCategories.map((c: Record<string, any>, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.count / data.topCategories[0].count) * 100}%` }} />
                  </div>
                  <span className="font-bold text-primary-500 w-8 text-right">{c.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ data }: { data: Record<string, any> }) {
  if (!data.users) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total: {data.total} users</p>
      {data.users.map((u: Record<string, any>) => (
        <div key={u.id} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center text-lg overflow-hidden">
            {u.profilePhoto ? <img src={u.profilePhoto} alt="" className="w-full h-full object-cover" /> : 'ðŸ‘¤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{u.name || 'No name'}</p>
            <p className="text-[10px] text-slate-500">+91 {u.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary-500">â‚¹{u.spent}</p>
            <p className="text-[10px] text-slate-400">{u.bookings} orders</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkersTab({ data, reload }: { data: Record<string, any>; reload: () => void }) {
  if (!data.workers) return null;
  const handleVerify = async (id: string) => {
    try { await admin.verifyWorker(id); toast.success('Verified!'); reload(); } catch { toast.error('Failed'); }
  };
  const handleToggle = async (id: string) => {
    try { const r = await admin.toggleWorkerActive(id); toast.success(r.message); reload(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl p-3 text-center">
          <p className="text-lg font-extrabold">{data.total}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider">Total</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl p-3 text-center">
          <p className="text-lg font-extrabold">{data.verified}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider">Verified</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl p-3 text-center">
          <p className="text-lg font-extrabold">{data.pending}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider">Pending</p>
        </div>
      </div>

      {data.workers.map((w: Record<string, any>) => (
        <div key={w.id} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center text-lg">
              {w.skillEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-bold text-sm truncate">{w.name}</p>
                {w.isVerified && <BadgeCheck size={12} className="fill-green-500 text-white" />}
                {!w.isActive && <Ban size={12} className="text-red-500" />}
              </div>
              <p className="text-[10px] text-slate-500">{w.skill} â€¢ {w.rating}â­ â€¢ {w.totalJobs} jobs</p>
            </div>
            <p className="text-sm font-bold text-primary-500">â‚¹{w.earnings}</p>
          </div>

          {w.aadhaarUrl && (
            <a href={w.aadhaarUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-600 font-bold mb-2 underline">
              ðŸ“„ View Aadhaar Document
            </a>
          )}
          <div className="flex gap-2 text-xs">
            {!w.isVerified && (
              <button onClick={() => handleVerify(w.id)} className="flex-1 bg-green-500 text-white py-1.5 rounded-lg font-bold flex items-center justify-center gap-1">
                <CheckCircle size={12} /> Verify
              </button>
            )}
            <button onClick={() => handleToggle(w.id)} className={`flex-1 py-1.5 rounded-lg font-bold ${w.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {w.isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingsTab({ data }: { data: Record<string, any> }) {
  if (!data.bookings) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total: {data.total} bookings</p>
      {data.bookings.map((b: Record<string, any>) => (
        <div key={b.id} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center text-lg">
              {b.category_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{b.category_name} â†’ {b.worker_name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{b.booking_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary-500">â‚¹{b.total_amount}</p>
              <p className={`text-[10px] uppercase font-bold ${
                b.status === 'completed' ? 'text-green-500' :
                b.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'
              }`}>{b.status?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsTab({ data }: { data: Record<string, any> }) {
  if (!data.summary) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 rounded-2xl p-4">
          <p className="text-3xl font-extrabold">â‚¹{data.summary.revenue}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider mt-1">Total Revenue</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 rounded-2xl p-4">
          <p className="text-3xl font-extrabold">â‚¹{data.summary.profit}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider mt-1">Your Profit</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total',    value: data.summary.total,    color: 'text-slate-600' },
          { label: 'Captured', value: data.summary.captured, color: 'text-green-500' },
          { label: 'Pending',  value: data.summary.pending,  color: 'text-amber-500' },
          { label: 'Failed',   value: data.summary.failed,   color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-xl p-2 text-center">
            <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-slate-500 uppercase font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {data.payments?.slice(0, 20).map((p: Record<string, any>) => (
          <div key={p.id} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              p.status === 'captured' ? 'bg-green-50 text-green-500' :
              p.status === 'pending'  ? 'bg-amber-50 text-amber-500' :
              'bg-red-50 text-red-500'
            }`}>
              <CreditCard size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">â‚¹{p.amount}</p>
              <p className="text-[10px] text-slate-500 font-mono">{p.booking_number || p.razorpay_order_id}</p>
            </div>
            <p className={`text-[10px] uppercase font-bold ${
              p.status === 'captured' ? 'text-green-500' :
              p.status === 'pending'  ? 'text-amber-500' : 'text-red-500'
            }`}>{p.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CouponsTab({ data, reload }: { data: Record<string, any>; reload: () => void }) {
  if (!data.coupons) return null;
  const handleToggle = async (code: string) => {
    try { const r = await admin.toggleCoupon(code); toast.success(r.message); reload(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-2">
      {data.coupons.map((c: Record<string, any>) => (
        <div key={c.code} className="bg-white dark:bg-ink-900 border border-slate-100 dark:border-ink-800 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-extrabold text-base text-primary-500 font-mono">{c.code}</p>
              <p className="text-xs text-slate-500">{c.description}</p>
            </div>
            <button onClick={() => handleToggle(c.code)} className={`px-3 py-1 rounded-full text-[10px] font-bold ${c.active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
              {c.active ? 'â— ACTIVE' : 'PAUSED'}
            </button>
          </div>
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span>Used: <strong className="text-slate-700 dark:text-slate-300">{c.usage_count || 0}x</strong></span>
            <span>Min: <strong className="text-slate-700 dark:text-slate-300">â‚¹{c.minOrder}</strong></span>
            {c.firstTimeOnly && <span className="text-amber-600 font-bold">First-time only</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
