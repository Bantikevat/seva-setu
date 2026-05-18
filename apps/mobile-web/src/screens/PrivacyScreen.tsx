/**
 * PRIVACY POLICY — Premium editorial layout
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react';

const sections = [
  {
    num: '01',
    title: 'What We Collect',
    icon: Database,
    content: [
      'Phone number — required for OTP login and SMS notifications.',
      'Name & email — optional, for personalization.',
      'Address & location (GPS) — to find nearby workers.',
      'Booking history — to provide better recommendations.',
      'Photos you upload — for service requests and worker portfolios.',
      'Device info — for analytics and security.',
    ],
  },
  {
    num: '02',
    title: 'How We Use It',
    icon: Eye,
    content: [
      'To process bookings and match you with workers.',
      'To send booking confirmations and updates via SMS/WhatsApp.',
      'To improve our service with AI recommendations.',
      'To detect and prevent fraud.',
      'To provide customer support.',
      'We never sell your data. Ever.',
    ],
  },
  {
    num: '03',
    title: 'Who We Share With',
    icon: Globe,
    content: [
      'Workers — they see your name, address, and booking details to complete the service.',
      'Payment partners (Razorpay) — to process payments securely.',
      'SMS providers (MSG91) — to deliver OTPs and updates.',
      'Law enforcement — only if legally required.',
      'We never share your data with advertisers or third parties for marketing.',
    ],
  },
  {
    num: '04',
    title: 'Your Rights',
    icon: UserCheck,
    content: [
      'Access — Request a copy of your data anytime.',
      'Correction — Update or correct your information.',
      'Deletion — Delete your account and all associated data.',
      'Portability — Export your data in machine-readable format.',
      'Opt-out — Stop marketing communications anytime.',
      'Contact privacy@sevasetu.in to exercise any of these rights.',
    ],
  },
  {
    num: '05',
    title: 'Data Security',
    icon: Lock,
    content: [
      'All data is encrypted in transit (HTTPS/TLS).',
      'Sensitive data is encrypted at rest.',
      'Passwords (and OTPs) are never stored in plain text.',
      'Regular security audits and penetration testing.',
      'PCI-DSS compliant payment processing.',
      'Bank-grade infrastructure (AWS).',
    ],
  },
  {
    num: '06',
    title: 'Cookies & Tracking',
    icon: Shield,
    content: [
      'We use minimal cookies — only what is essential.',
      'No third-party advertising trackers.',
      'You can disable cookies in browser settings.',
      'We respect "Do Not Track" signals.',
    ],
  },
];

export const PrivacyScreen = () => {
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
            <h2 className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50">Privacy Policy</h2>
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
            <Shield size={22} strokeWidth={1.5} className="text-primary-500" />
          </div>

          <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-3">
            Your privacy<br />
            <span className="italic font-normal text-primary-500">matters.</span>
          </h1>

          <p className="text-sm text-ink-400 dark:text-cream-100/50">
            Last updated: May 14, 2026 · Effective immediately
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-8">
            {[
              { label: 'No data selling',  icon: Lock },
              { label: 'Encrypted',        icon: Shield },
              { label: 'GDPR compliant',   icon: UserCheck },
            ].map((b) => (
              <div key={b.label} className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-3 text-center">
                <b.icon size={16} strokeWidth={1.5} className="text-primary-500 mx-auto mb-1" />
                <p className="text-[10px] font-medium text-ink-700 dark:text-cream-100">{b.label}</p>
              </div>
            ))}
          </div>
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
                <div className="flex items-center gap-3">
                  <section.icon size={18} strokeWidth={1.5} className="text-primary-500" />
                  <h3 className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50 leading-tight">
                    {section.title}
                  </h3>
                </div>
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

        {/* Promise card */}
        <div className="bg-ink-900 dark:bg-ink-950 text-cream-50 rounded-3xl p-8 my-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/15 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-3">
              Our promise
            </p>
            <h3 className="font-display text-2xl tracking-tight mb-3">
              We treat your data<br />
              like we'd want ours treated.
            </h3>
            <p className="text-sm text-cream-100/70 mb-5">
              No selling. No tracking. No nonsense. Just what we need to provide you with great service.
            </p>

            <a
              href="mailto:privacy@sevasetu.in"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold"
            >
              <Mail size={14} />
              privacy@sevasetu.in
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-300 font-medium">
            © 2026 Seva Setu Technologies Pvt Ltd
          </p>
          <p className="text-[10px] text-ink-300 mt-2">
            Your trust, our priority 🇮🇳
          </p>
        </div>
      </div>
    </div>
  );
};
