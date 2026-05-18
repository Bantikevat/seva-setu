/**
 * EMAIL SERVICE — Nodemailer + Gmail SMTP
 *
 * Setup karne ke liye:
 * 1. Gmail mein "App Password" banao (Google Account → Security → App Passwords)
 * 2. .env mein set karo:
 *    EMAIL_USER=tumhara@gmail.com
 *    EMAIL_PASS=xxxx xxxx xxxx xxxx   (16-char app password)
 *
 * Dev mode: Console mein print (koi mail nahi jata)
 */

const nodemailer = require('nodemailer');
const config     = require('../config/env');
const logger     = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!config.emailUser || !config.emailPass) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  return transporter;
};

const isConfigured = () => !!(config.emailUser && config.emailPass);

const emailService = {
  isConfigured,

  /**
   * Plain email bhejo
   */
  send: async ({ to, subject, html, text }) => {
    if (config.isDev && !isConfigured()) {
      logger.info(`[EMAIL-DEV] To: ${to}`);
      logger.info(`[EMAIL-DEV] Subject: ${subject}`);
      logger.info(`[EMAIL-DEV] Body: ${text || '(html only)'}`);
      return { success: true, provider: 'console', messageId: `dev-${Date.now()}` };
    }

    const t = getTransporter();
    if (!t) {
      logger.warn('Email not configured — skipped');
      return { success: false, error: 'NOT_CONFIGURED' };
    }

    try {
      const info = await t.sendMail({
        from:    config.emailFrom,
        to,
        subject,
        text,
        html,
      });
      logger.info(`[EMAIL] Sent to ${to} — ${info.messageId}`);
      return { success: true, provider: 'gmail', messageId: info.messageId };
    } catch (error) {
      logger.error('Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Booking confirmation email to customer
   */
  sendBookingConfirmation: async ({ to, customerName, booking }) => {
    const subject = `✅ Booking Confirmed — #${booking.bookingNumber} | Seva Setu`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: system-ui, sans-serif; background:#f8f7f4; padding:20px; }
    .card { max-width:520px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#FF6B35,#FF9500); padding:28px 24px; color:#fff; text-align:center; }
    .logo { font-size:32px; margin-bottom:8px; }
    .brand { font-size:22px; font-weight:800; letter-spacing:2px; }
    .tag { font-size:11px; opacity:0.85; margin-top:4px; }
    .body { padding:24px; }
    .hi { font-size:17px; font-weight:700; margin-bottom:16px; color:#0f172a; }
    .booking-box { background:#fff8f5; border:2px solid #FF6B3530; border-radius:14px; padding:16px; margin-bottom:16px; }
    .row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; border-bottom:1px solid #FF6B3515; }
    .row:last-child { border:none; font-weight:800; font-size:16px; color:#FF6B35; }
    .label { color:#64748b; }
    .value { font-weight:600; color:#0f172a; text-align:right; }
    .info { font-size:13px; color:#64748b; line-height:1.6; margin-bottom:20px; }
    .btn { display:block; background:#FF6B35; color:#fff; text-decoration:none; text-align:center; padding:14px; border-radius:12px; font-weight:700; font-size:14px; margin-bottom:16px; }
    .footer { background:#f8f7f4; padding:16px 24px; text-align:center; font-size:11px; color:#94a3b8; }
    .footer a { color:#FF6B35; text-decoration:none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">🏠</div>
      <div class="brand">SEVA SETU</div>
      <div class="tag">Ghar Ki Har Zaroorat, Ek App Mein</div>
    </div>
    <div class="body">
      <p class="hi">Namaste ${customerName || 'Customer'}! 🙏</p>
      <p class="info">Aapki booking confirm ho gayi. Worker jaldi aapko confirm karega.</p>

      <div class="booking-box">
        <div class="row"><span class="label">Booking #</span><span class="value">${booking.bookingNumber}</span></div>
        <div class="row"><span class="label">Service</span><span class="value">${booking.categoryEmoji || ''} ${booking.categoryName}</span></div>
        <div class="row"><span class="label">Worker</span><span class="value">${booking.workerName}</span></div>
        <div class="row"><span class="label">Worker Phone</span><span class="value">+91 ${booking.workerPhone}</span></div>
        <div class="row"><span class="label">Scheduled</span><span class="value">${new Date(booking.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="row"><span class="label">Address</span><span class="value" style="max-width:200px">${booking.fullAddress}</span></div>
        <div class="row"><span class="label">Total</span><span class="value">₹${booking.totalAmount}</span></div>
      </div>

      <a class="btn" href="https://sevasetu.in/booking/${booking.id}">Booking Track Karo →</a>

      <p class="info">Koi samasya? <a href="https://sevasetu.in/help" style="color:#FF6B35">Help Center</a> pe jaao ya WhatsApp karo.</p>
    </div>
    <div class="footer">
      <p>© 2026 Seva Setu · <a href="https://sevasetu.in/privacy">Privacy</a> · <a href="https://sevasetu.in/terms">Terms</a></p>
      <p style="margin-top:4px">Ujjain, Madhya Pradesh · help@sevasetu.in</p>
    </div>
  </div>
</body>
</html>`;

    const text = `Booking Confirmed!\n\n#${booking.bookingNumber}\nService: ${booking.categoryName}\nWorker: ${booking.workerName} (+91 ${booking.workerPhone})\nScheduled: ${new Date(booking.scheduledAt).toLocaleString('en-IN')}\nTotal: ₹${booking.totalAmount}\n\nTrack: https://sevasetu.in/booking/${booking.id}`;

    return emailService.send({ to, subject, html, text });
  },

  /**
   * New job email to worker
   */
  sendNewJobAlert: async ({ to, workerName, booking }) => {
    const subject = `🔔 Naya Kaam! ₹${booking.workerPayout} — ${booking.categoryName} | Seva Setu`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family:system-ui,sans-serif; background:#f0fdf4; padding:20px; }
    .card { max-width:520px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#10b981,#059669); padding:28px 24px; color:#fff; text-align:center; }
    .brand { font-size:22px; font-weight:800; letter-spacing:2px; }
    .body { padding:24px; }
    .amount { font-size:42px; font-weight:800; color:#10b981; text-align:center; margin:12px 0; }
    .row { display:flex; justify-content:space-between; padding:7px 0; font-size:14px; border-bottom:1px solid #f0fdf4; }
    .label { color:#64748b; } .value { font-weight:600; color:#0f172a; }
    .btn { display:block; background:#10b981; color:#fff; text-decoration:none; text-align:center; padding:14px; border-radius:12px; font-weight:700; font-size:14px; margin-top:16px; }
    .footer { background:#f0fdf4; padding:14px; text-align:center; font-size:11px; color:#94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">🔔 NAYA KAAM!</div>
    </div>
    <div class="body">
      <p style="font-size:16px;font-weight:700;margin-bottom:4px">Namaste ${workerName}!</p>
      <p style="color:#64748b;font-size:13px;margin-bottom:16px">Ek naya booking request aaya hai aapke liye.</p>
      <div class="amount">₹${booking.workerPayout}</div>
      <p style="text-align:center;color:#64748b;font-size:12px;margin-bottom:16px">Aapki earning is job pe</p>
      <div class="row"><span class="label">Service</span><span class="value">${booking.categoryEmoji || ''} ${booking.categoryName}</span></div>
      <div class="row"><span class="label">Booking #</span><span class="value">${booking.bookingNumber}</span></div>
      <div class="row"><span class="label">Scheduled</span><span class="value">${new Date(booking.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="row"><span class="label">Location</span><span class="value">${booking.fullAddress}</span></div>
      <a class="btn" href="https://sevasetu.in/worker-mode">App Mein Accept Karo →</a>
    </div>
    <div class="footer">Seva Setu · Ujjain · help@sevasetu.in</div>
  </div>
</body>
</html>`;

    const text = `Naya Kaam!\n\n₹${booking.workerPayout} milega\nService: ${booking.categoryName}\n#${booking.bookingNumber}\n${new Date(booking.scheduledAt).toLocaleString('en-IN')}\n${booking.fullAddress}\n\nApp mein accept karo: https://sevasetu.in/worker-mode`;

    return emailService.send({ to, subject, html, text });
  },
};

module.exports = emailService;
