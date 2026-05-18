/**
 * HELP CENTER SCREEN
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, MessageCircle, Phone, Mail,
  Search, ShieldCheck, CreditCard, Calendar, Star,
} from 'lucide-react';

const FAQ_CATEGORIES = [
  { icon: Calendar,    title: 'Bookings',  color: 'bg-blue-100 text-blue-600' },
  { icon: CreditCard,  title: 'Payments',  color: 'bg-green-100 text-green-600' },
  { icon: ShieldCheck, title: 'Safety',    color: 'bg-purple-100 text-purple-600' },
  { icon: Star,        title: 'Ratings',   color: 'bg-yellow-100 text-yellow-600' },
];

const FAQS = [
  {
    q: 'How do I book a service?',
    a: 'Home screen pe category select karo (Plumber, Electrician, etc.). Phir worker choose karke "Book Now" pe click karo. Date, time aur address select karke confirm.',
  },
  {
    q: 'Cancel kaise karein?',
    a: 'Bookings tab kholo → Booking pe click → "Cancel Booking" button. Pending stage tak free cancellation.',
  },
  {
    q: 'Payment kaise hota hai?',
    a: 'UPI, Credit/Debit Card, Net Banking — sab support karte hain. Razorpay se secure payment hota hai.',
  },
  {
    q: 'Refund kab milta hai?',
    a: 'Cancel ya issue ki case mein, payment 5-7 working days mein wapas aata hai (same payment method pe).',
  },
  {
    q: 'Worker verified hain?',
    a: 'Haan! Saare workers Aadhaar verified, background checked aur skill certified hain. Insurance bhi covered hai.',
  },
  {
    q: 'Worker time pe nahi aaya toh?',
    a: 'App mein "Live Tracking" se exact location dekho. Phir bhi delay ho toh helpline call karo, hum compensation denge.',
  },
  {
    q: 'Service kharab ho gayi toh?',
    a: 'Booking detail page pe "Report Issue" karo. Hum 24 hours mein resolve karenge. Quality guarantee with us.',
  },
  {
    q: 'Pricing transparent hai?',
    a: 'Bilkul! Plumber ₹299, Electrician ₹349, etc. Booking time pe full price dikhaayenge. Koi hidden charge nahi.',
  },
  {
    q: 'Password bhool gaya / login nahi ho raha?',
    a: 'Tension nahi! Seva Setu mein koi password nahi hota. Bas apna 10-digit mobile number daalo, OTP aayega SMS pe, woh enter karo aur ho gaya login. Naya phone ya number badal gaya? Wahi process — sirf naye number se OTP lo.',
  },
  {
    q: 'Account delete kaise karein?',
    a: 'Profile screen pe scroll down karo → "Delete account (permanent)" button hai. Confirm karne ke baad account aur saara data hat jayega (GDPR compliant). Pehle data download karna chahte ho toh "Download my data" button use karo.',
  },
];

export const HelpScreen = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 pt-12 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/25 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-extrabold">Help & Support</h2>
        </div>

        <p className="text-sm opacity-90 mb-4">Kuch puchhna chahte ho? Hum yahan hain.</p>

        {/* Search */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl flex items-center gap-2 px-3 py-2">
          <Search size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="flex-1 bg-transparent outline-none placeholder:text-white/70 text-sm"
          />
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Quick contact */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a href="tel:+916464466512" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 text-center hover:shadow-card transition">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Phone size={18} />
            </div>
            <p className="text-[11px] font-bold">Call Us</p>
            <p className="text-[10px] text-slate-500">9am–9pm</p>
          </a>
          <a href="https://wa.me/916464466512?text=Hi%20Seva%20Setu%20support" target="_blank" rel="noopener" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 text-center hover:shadow-card transition">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <MessageCircle size={18} />
            </div>
            <p className="text-[11px] font-bold">WhatsApp</p>
            <p className="text-[10px] text-slate-500">Instant</p>
          </a>
          <a href="mailto:help@sevasetu.in" className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 text-center hover:shadow-card transition">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Mail size={18} />
            </div>
            <p className="text-[11px] font-bold">Email</p>
            <p className="text-[10px] text-slate-500">24 hr reply</p>
          </a>
        </div>

        {/* Categories */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Browse by Topic</h3>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {FAQ_CATEGORIES.map((cat) => (
            <button key={cat.title} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 text-center hover:shadow-card transition">
              <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                <cat.icon size={18} />
              </div>
              <p className="text-[10px] font-bold">{cat.title}</p>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center text-slate-500 text-sm">
              No results found
            </div>
          ) : (
            filtered.map((f, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <span className="flex-1 font-bold text-sm">{f.q}</span>
                  <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-slate-400" />
                  </motion.div>
                </button>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-zinc-900 dark:to-zinc-800 border border-orange-200 dark:border-zinc-700 rounded-2xl p-5 text-center mt-6">
          <p className="text-2xl mb-2">🤔</p>
          <p className="font-bold mb-1">Still need help?</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Our team is here 24×7
          </p>
          <a href="tel:1800-XXX-XXX" className="inline-block bg-primary-500 text-white text-sm font-bold px-5 py-2 rounded-xl">
            Call Helpline
          </a>
        </div>
      </div>
    </div>
  );
};
