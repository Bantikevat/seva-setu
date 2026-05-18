/**
 * PROMO CODE INPUT — Apply discount code in booking form
 * Free coupon validation — codes stored in constants (no backend needed)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, ChevronDown } from 'lucide-react';

interface PromoResult {
  code: string;
  discountPct: number;
  label: string;
}

// Predefined promo codes (no backend needed)
const VALID_CODES: Record<string, PromoResult> = {
  WELCOME30:   { code: 'WELCOME30',   discountPct: 30, label: 'New user — 30% off' },
  DIWALI50:    { code: 'DIWALI50',    discountPct: 50, label: 'Diwali special — 50% off' },
  UJJAIN10:    { code: 'UJJAIN10',    discountPct: 10, label: 'Ujjain local — 10% off' },
  REFER200:    { code: 'REFER200',    discountPct: 20, label: 'Referral bonus — 20% off' },
  FIRST50:     { code: 'FIRST50',     discountPct: 50, label: 'Pehli booking — 50% off' },
};

interface Props {
  basePrice: number;
  onDiscount: (discount: number, code: string) => void;
}

export const PromoCodeInput = ({ basePrice, onDiscount }: Props) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<PromoResult | null>(null);
  const [error, setError] = useState('');

  const handleApply = () => {
    const upper = code.trim().toUpperCase();
    if (!upper) return;

    if (applied) {
      // Remove applied code
      setApplied(null);
      setCode('');
      onDiscount(0, '');
      return;
    }

    const promo = VALID_CODES[upper];
    if (!promo) {
      setError('Invalid code. Try WELCOME30 for 30% off!');
      return;
    }

    const discount = Math.round(basePrice * (promo.discountPct / 100));
    setApplied(promo);
    setError('');
    onDiscount(discount, promo.code);
  };

  const discountAmt = applied ? Math.round(basePrice * (applied.discountPct / 100)) : 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-primary-500 font-medium"
      >
        <Tag size={12} strokeWidth={2.5} />
        {applied ? `Code applied: ${applied.code}` : 'Promo code hai?'}
        <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {applied ? (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2.5">
                  <Check size={14} className="text-green-600" strokeWidth={2.5} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">{applied.label}</p>
                    <p className="text-[11px] text-green-600 dark:text-green-500">₹{discountAmt} bachoge!</p>
                  </div>
                  <button onClick={handleApply} className="text-green-400 hover:text-red-500 transition">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="WELCOME30"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm font-mono font-medium focus:outline-none focus:border-primary-500 uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X size={11} strokeWidth={2.5} /> {error}
                </p>
              )}

              {!applied && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(VALID_CODES).map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCode(c); setError(''); }}
                      className="text-[10px] bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-cream-100/70 px-2 py-1 rounded-lg font-mono hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
