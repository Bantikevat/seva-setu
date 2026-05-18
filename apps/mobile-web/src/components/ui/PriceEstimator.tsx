/**
 * PRICE ESTIMATOR — "Approximate kitna lagega?" before booking
 * Zero backend, purely frontend calculation based on service type + size
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, Info } from 'lucide-react';

interface PriceRule {
  base: number;
  perUnit?: number;
  unitLabel?: string;
  extras: { label: string; price: number }[];
}

const PRICE_RULES: Record<string, PriceRule> = {
  Plumber: {
    base: 299,
    perUnit: 150,
    unitLabel: 'extra problem',
    extras: [
      { label: 'Pipe replacement', price: 200 },
      { label: 'Geyser repair', price: 300 },
      { label: 'Tap fitting', price: 150 },
    ],
  },
  Electrician: {
    base: 349,
    perUnit: 100,
    unitLabel: 'extra point',
    extras: [
      { label: 'MCB change', price: 250 },
      { label: 'Fan fitting', price: 200 },
      { label: 'AC wiring', price: 400 },
    ],
  },
  'AC Repair': {
    base: 499,
    extras: [
      { label: 'Gas refill', price: 800 },
      { label: 'Deep cleaning', price: 400 },
      { label: 'PCB repair', price: 600 },
    ],
  },
  Cleaning: {
    base: 249,
    perUnit: 100,
    unitLabel: 'room',
    extras: [
      { label: 'Kitchen deep clean', price: 300 },
      { label: 'Bathroom clean', price: 200 },
      { label: 'Sofa/carpet clean', price: 400 },
    ],
  },
  Carpenter: {
    base: 399,
    perUnit: 200,
    unitLabel: 'item',
    extras: [
      { label: 'Furniture assembly', price: 300 },
      { label: 'Door repair', price: 250 },
    ],
  },
  Cook: {
    base: 499,
    perUnit: 150,
    unitLabel: 'person',
    extras: [
      { label: 'Special cuisine', price: 300 },
      { label: 'Desserts', price: 200 },
    ],
  },
  Beauty: {
    base: 599,
    extras: [
      { label: 'Bridal makeup', price: 1500 },
      { label: 'Waxing', price: 300 },
      { label: 'Facial', price: 400 },
    ],
  },
  Painter: {
    base: 699,
    perUnit: 8,
    unitLabel: 'sq ft',
    extras: [
      { label: 'Putty work', price: 500 },
      { label: 'Texture paint', price: 800 },
    ],
  },
};

interface Props {
  category: string;
}

export const PriceEstimator = ({ category }: Props) => {
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const rule = PRICE_RULES[category];
  if (!rule) return null;

  const toggleExtra = (label: string) =>
    setSelectedExtras((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label]
    );

  const extraTotal = rule.extras
    .filter((e) => selectedExtras.includes(e.label))
    .reduce((sum, e) => sum + e.price, 0);

  const unitTotal = rule.perUnit ? (units - 1) * rule.perUnit : 0;
  const subtotal = rule.base + unitTotal + extraTotal;
  const platform = Math.round(subtotal * 0.1);
  const total = subtotal + platform;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-ink-500 dark:text-cream-100/60 font-medium hover:text-primary-500 transition"
      >
        <Calculator size={13} strokeWidth={2.5} />
        Price estimate karo
        <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 space-y-4">
              {/* Units */}
              {rule.perUnit && rule.unitLabel && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-400 font-medium mb-2">
                    Kitne {rule.unitLabel}?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUnits(Math.max(1, units - 1))}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-ink-700 border border-ink-200 dark:border-ink-600 flex items-center justify-center text-lg font-bold text-ink-600 dark:text-cream-100"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-ink-900 dark:text-cream-50 w-6 text-center">{units}</span>
                    <button
                      type="button"
                      onClick={() => setUnits(units + 1)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-ink-700 border border-ink-200 dark:border-ink-600 flex items-center justify-center text-lg font-bold text-ink-600 dark:text-cream-100"
                    >
                      +
                    </button>
                    <span className="text-xs text-ink-400">{rule.unitLabel}{units > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {/* Extras */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-400 font-medium mb-2">
                  Extra kaam (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {rule.extras.map((e) => (
                    <button
                      key={e.label}
                      type="button"
                      onClick={() => toggleExtra(e.label)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        selectedExtras.includes(e.label)
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-white dark:bg-ink-800 border-ink-200 dark:border-ink-600 text-ink-600 dark:text-cream-100/70'
                      }`}
                    >
                      {e.label} +₹{e.price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-ink-800 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-ink-500">
                  <span>Base charge</span>
                  <span>₹{rule.base}</span>
                </div>
                {unitTotal > 0 && (
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>Extra {rule.unitLabel}s</span>
                    <span>+₹{unitTotal}</span>
                  </div>
                )}
                {extraTotal > 0 && (
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>Additional services</span>
                    <span>+₹{extraTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-ink-500">
                  <span>Platform fee (10%)</span>
                  <span>+₹{platform}</span>
                </div>
                <div className="border-t border-ink-100 dark:border-ink-700 pt-1.5 flex justify-between font-bold">
                  <span className="text-sm text-ink-900 dark:text-cream-50">Estimated Total</span>
                  <span className="text-base text-primary-500">₹{total}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-ink-400">
                <Info size={11} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
                Yeh sirf estimate hai. Worker site pe aake exact price batayega.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
