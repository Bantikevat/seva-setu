import { ShieldCheck, BadgeCheck, FileCheck, Award } from 'lucide-react';

export const TrustBadges = () => (
  <div className="grid grid-cols-4 gap-2 px-4 py-3">
    {[
      { icon: ShieldCheck, label: 'Verified',  color: 'text-green-600' },
      { icon: BadgeCheck,  label: 'Insured',   color: 'text-blue-600'  },
      { icon: FileCheck,   label: 'GST Reg.',  color: 'text-purple-600' },
      { icon: Award,       label: 'ISO 9001',  color: 'text-amber-600' },
    ].map(({ icon: Icon, label, color }) => (
      <div key={label} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-2 text-center">
        <Icon size={20} className={`mx-auto mb-1 ${color}`} />
        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{label}</p>
      </div>
    ))}
  </div>
);
