/**
 * TERMS OF SERVICE — Premium editorial layout
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Mail } from 'lucide-react';

const sections = [
  {
    num: '01',
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using Seva Setu ("Service"), you agree to be bound by these Terms of Service.',
      'If you do not agree to these terms, please do not use our Service.',
      'These terms apply to all customers, workers, and visitors of Seva Setu.',
    ],
  },
  {
    num: '02',
    title: 'Service Description',
    content: [
      'Seva Setu is a hyperlocal platform connecting customers with verified home service professionals (plumbers, electricians, cleaners, etc.).',
      'We provide a booking interface, payment processing, and worker verification.',
      'We are not directly providing services — we facilitate connections between you and independent workers.',
    ],
  },
  {
    num: '03',
    title: 'Account Registration',
    content: [
      'You must be 18 years or older to register.',
      'Your phone number is your primary identifier.',
      'You are responsible for maintaining the confidentiality of your account.',
      'You agree to provide accurate information at all times.',
    ],
  },
  {
    num: '04',
    title: 'Bookings & Payments',
    content: [
      'All bookings are confirmed only after worker acceptance.',
      'Payment is processed through Razorpay (UPI, Cards, Net Banking).',
      'Cancellation policy: Free cancellation up to "Confirmed" status. After "On The Way", standard charges may apply.',
      'Refunds are processed within 5-7 business days to the original payment method.',
    ],
  },
  {
    num: '05',
    title: 'Worker Verification',
    content: [
      'All workers on Seva Setu are background-verified.',
      'Worker ratings and reviews are visible to help you make informed choices.',
      'We do not employ workers directly — they are independent contractors.',
    ],
  },
  {
    num: '06',
    title: 'User Conduct',
    content: [
      'Respect workers and treat them with dignity.',
      'Do not engage in fraudulent activity, harassment, or discrimination.',
      'Do not provide false reviews or ratings.',
      'Misuse of the platform may result in account suspension.',
    ],
  },
  {
    num: '07',
    title: 'Pricing & Fees',
    content: [
      'Prices are clearly displayed before booking confirmation.',
      'Platform fee (10%) is included in the total amount.',
      'No hidden charges. What you see is what you pay.',
      'Prices may vary based on time, day, and surge pricing.',
    ],
  },
  {
    num: '08',
    title: 'Insurance & Liability',
    content: [
      'Workers carry insurance for accidental damages.',
      'Seva Setu provides limited mediation in case of disputes.',
      'We are not liable for any indirect or consequential damages.',
      'Maximum liability is limited to the booking amount.',
    ],
  },
  {
    num: '09',
    title: 'Intellectual Property',
    content: [
      'All content, branding, and design are property of Seva Setu Technologies.',
      'You may not copy, modify, or redistribute without written permission.',
      'User-generated content (reviews, photos) remains yours but you grant us license to use.',
    ],
  },
  {
    num: '10',
    title: 'Termination',
    content: [
      'You may delete your account at any time from Profile settings.',
      'We reserve the right to suspend or terminate accounts violating these terms.',
      'Pending bookings will be honored or refunded as applicable.',
    ],
  },
  {
    num: '11',
    title: 'Changes to Terms',
    content: [
      'We may update these terms periodically.',
      'You will be notified of significant changes via SMS or email.',
      'Continued use of the Service constitutes acceptance of updated terms.',
    ],
  },
  {
    num: '12',
    title: 'Governing Law',
    content: [
      'These terms are governed by the laws of India.',
      'Jurisdiction: Courts in Jaipur, Rajasthan.',
      'Any disputes will be resolved through mediation first, then arbitration.',
    ],
  },
];

export const TermsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-cream-50/95 dark:bg-ink-900/95 backdrop-blur-xl border-b border-ink-100 dark:border-ink-700">
        <div className="px-6 pt-12 pb-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
          </motion.button>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium">Legal</p>
            <h2 className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50">Terms of Service</h2>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-10"
        >
          <div className="w-14 h-14 border border-ink-200 dark:border-ink-700 rounded-2xl flex items-center justify-center mb-6">
            <FileText size={22} strokeWidth={1.5} className="text-primary-500" />
          </div>

          <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-3">
            The fine print<br />
            <span className="italic font-normal text-primary-500">made simple.</span>
          </h1>

          <p className="text-sm text-ink-400 dark:text-cream-100/50">
            Last updated: May 14, 2026 · Effective immediately
          </p>
        </motion.div>

        <div className="border-t border-ink-100 dark:border-ink-700" />

        {/* Sections */}
        <div className="py-6 space-y-px">
          {sections.map((section, i) => (
            <motion.div
              key={section.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className="py-7 border-b border-ink-100 dark:border-ink-700"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <p className="font-mono text-xs text-ink-300 tabular-nums">{section.num}</p>
                <h3 className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50 leading-tight">
                  {section.title}
                </h3>
              </div>

              <div className="ml-9 space-y-3">
                {section.content.map((para, j) => (
                  <p key={j} className="text-sm text-ink-700 dark:text-cream-100/70 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-ink-900 dark:bg-ink-950 text-cream-50 rounded-3xl p-8 my-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/15 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-3">
              Questions?
            </p>
            <h3 className="font-display text-2xl tracking-tight mb-2">
              Get in touch
            </h3>
            <p className="text-sm text-cream-100/70 mb-5">
              Our legal team is happy to clarify any concerns.
            </p>

            <a
              href="mailto:legal@sevasetu.in"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold"
            >
              <Mail size={14} />
              legal@sevasetu.in
            </a>
          </div>
        </div>

        {/* Footer signature */}
        <div className="text-center py-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-300 font-medium">
            © 2026 Seva Setu Technologies Pvt Ltd
          </p>
          <p className="text-[10px] text-ink-300 mt-2">
            Made with care in India 🇮🇳
          </p>
        </div>
      </div>
    </div>
  );
};
