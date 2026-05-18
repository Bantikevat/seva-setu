/**
 * BUNDLE PACKAGES — Predefined service combos at a discount
 * URL: /packages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Check, ArrowUpRight, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Bundle {
  id: string;
  emoji: string;
  name: string;
  description: string;
  services: string[];
  originalPrice: number;
  bundlePrice: number;
  tag?: string;
  popular?: boolean;
}

const BUNDLES: Bundle[] = [
  {
    id: 'diwali-cleaning',
    emoji: '🪔',
    name: 'Diwali Cleaning Special',
    description: 'Ghar ko chamkao tyohar se pehle — full home makeover!',
    services: ['Deep House Cleaning', 'AC Servicing', 'Pest Control', 'Sofa Cleaning'],
    originalPrice: 2499,
    bundlePrice: 999,
    tag: 'Festival Special',
    popular: true,
  },
  {
    id: 'new-home',
    emoji: '🏠',
    name: 'New Home Starter',
    description: 'Naye ghar mein shift ho rahe ho? Ye sab ready karo ek saath.',
    services: ['Electrical Wiring Check', 'Plumbing Inspection', 'Deep Cleaning', 'Pest Control'],
    originalPrice: 1999,
    bundlePrice: 899,
    tag: 'New Home',
  },
  {
    id: 'monthly-maintenance',
    emoji: '🔧',
    name: 'Monthly Home Care',
    description: 'Har mahine ghar ki dekhbhal — subscription jaisa faayda.',
    services: ['Plumbing Check', 'Electrical Check', 'AC Filter Clean', 'Minor Repairs'],
    originalPrice: 1499,
    bundlePrice: 699,
    tag: 'Monthly',
    popular: true,
  },
  {
    id: 'summer-special',
    emoji: '❄️',
    name: 'Summer Cool Package',
    description: 'Garmiyon mein AC sahi rakho aur bijli bachao.',
    services: ['AC Deep Servicing', 'AC Gas Refill Check', 'Ceiling Fan Service', 'Cooler Cleaning'],
    originalPrice: 1799,
    bundlePrice: 799,
    tag: 'Summer',
  },
  {
    id: 'beauty-bridal',
    emoji: '💄',
    name: 'Bridal Beauty Bundle',
    description: 'Shaadi ke liye complete beauty treatment ghar pe.',
    services: ['Bridal Makeup', 'Hair Treatment', 'Threading & Waxing', 'Mehendi'],
    originalPrice: 3499,
    bundlePrice: 1499,
    tag: 'Bridal',
  },
  {
    id: 'kitchen-care',
    emoji: '🍳',
    name: 'Kitchen Deep Care',
    description: 'Rasoi ekdum saaf aur functional — ek baar mein sab.',
    services: ['Chimney Cleaning', 'Gas Stove Servicing', 'Kitchen Deep Clean', 'Pest Control'],
    originalPrice: 1299,
    bundlePrice: 649,
    tag: 'Kitchen',
  },
];

export const BundlePackagesScreen = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleBook = (bundle: Bundle) => {
    toast.success(`${bundle.emoji} ${bundle.name} book ho raha hai!`);
    // In production: navigate to booking flow with bundle pre-selected
    // For now: navigate to workers with first service as category
    const firstService = bundle.services[0];
    navigate(`/workers?category=${encodeURIComponent(firstService)}&bundle=${bundle.id}`);
  };

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* HEADER */}
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 mb-6">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Package size={28} className="text-primary-500" strokeWidth={2} />
          <h1 className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50">
            Bundle Deals
          </h1>
        </div>
        <p className="text-sm text-ink-400">Multiple services — ek saath, bade discount mein</p>
      </div>

      {/* SAVINGS BADGE */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-primary-500 to-orange-400 rounded-2xl p-4 flex items-center gap-3">
        <Tag size={20} className="text-white" strokeWidth={2.5} />
        <div>
          <p className="text-white font-semibold text-sm">Bundle mein save karo 40–60%</p>
          <p className="text-white/80 text-xs mt-0.5">Individually booking karne se zyada sasta</p>
        </div>
      </div>

      {/* BUNDLES LIST */}
      <div className="px-6 space-y-4">
        {BUNDLES.map((bundle, i) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`bg-white dark:bg-ink-800 rounded-3xl border-2 overflow-hidden transition ${
              selected === bundle.id
                ? 'border-primary-500'
                : 'border-ink-100 dark:border-ink-700'
            }`}
          >
            {/* Bundle header */}
            <div
              className="p-5 cursor-pointer"
              onClick={() => setSelected(selected === bundle.id ? null : bundle.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{bundle.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-ink-900 dark:text-cream-50">{bundle.name}</h3>
                      {bundle.popular && (
                        <span className="text-[9px] bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>
                    {bundle.tag && (
                      <span className="text-[10px] text-ink-400 font-medium">{bundle.tag}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-ink-900 dark:text-cream-50">₹{bundle.bundlePrice}</p>
                  <p className="text-xs text-ink-400 line-through">₹{bundle.originalPrice}</p>
                  <p className="text-xs text-green-600 font-semibold">
                    {Math.round((1 - bundle.bundlePrice / bundle.originalPrice) * 100)}% off
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-400 leading-relaxed">{bundle.description}</p>
            </div>

            {/* Expanded details */}
            {selected === bundle.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-ink-100 dark:border-ink-700 px-5 pb-5 pt-4"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-medium mb-3">
                  Included Services
                </p>
                <div className="space-y-2 mb-4">
                  {bundle.services.map((svc) => (
                    <div key={svc} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-green-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-ink-700 dark:text-cream-100/80">{svc}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleBook(bundle)}
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Sparkles size={14} strokeWidth={2.5} />
                  Book Bundle — ₹{bundle.bundlePrice}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-6 mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => navigate('/workers')}
          className="flex items-center gap-1.5 text-sm text-primary-500 font-medium"
        >
          Individual booking chahiye?
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
