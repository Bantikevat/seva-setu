import { useState } from 'react';
import { MapPin, Check, X } from 'lucide-react';

// Service area pincodes — Ujjain + surrounding
const SERVED_PINCODES = ['456001','456006','456010','456550','456221','456770','456664','456771','456001','456003','456221','456332','456550','456661','456662','456663','456664','456665','456770','456771','456776','456784'];

export const PincodeCheck = () => {
  const [pin, setPin]   = useState('');
  const [result, setResult] = useState<'yes' | 'no' | null>(null);

  const check = () => {
    if (!/^\d{6}$/.test(pin)) { setResult(null); return; }
    setResult(SERVED_PINCODES.includes(pin) ? 'yes' : 'no');
  };

  return (
    <div className="mx-4 my-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-primary-500" />
        <p className="text-sm font-bold">Aapke area mein available hain?</p>
      </div>
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit pincode"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setResult(null); }}
          className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-zinc-800 rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={check}
          disabled={pin.length !== 6}
          className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-xl disabled:opacity-50"
        >
          Check
        </button>
      </div>
      {result === 'yes' && (
        <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-bold">
          <Check size={14} /> Aapke area mein service available hai!
        </div>
      )}
      {result === 'no' && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-xs font-bold">
          <X size={14} /> Abhi tak ye area cover nahi hai. Jaldi launch karenge!
        </div>
      )}
    </div>
  );
};
