/**
 * NOTIFICATION TEMPLATES
 * -------------------------------------------------
 * Booking events ke ready-made messages.
 *
 * Usage:
 *   template.render('booking_created', { workerName: 'Rajesh', time: '5 PM' })
 *   → "🎉 Booking confirmed! Rajesh 5 PM pe aayega."
 */

const templates = {
  // ─── OTP ───
  otp_send: {
    sms:      '{{otp}} aapka Seva Setu OTP hai. 5 minute mein expire ho jayega. Kisi ke saath share na karein.',
    whatsapp: '🔐 *Seva Setu OTP*\n\nAapka code: *{{otp}}*\n\n5 min mein expire ho jayega.\nKisi ke saath share na karein.',
  },

  // ─── BOOKING — Customer ke liye ───
  booking_created_customer: {
    sms:      '✅ Booking #{{bookingNumber}} confirmed! {{categoryName}} - {{workerName}}. Track: sevasetu.app/b/{{bookingNumber}}',
    whatsapp: '🎉 *Booking Confirmed!*\n\n📋 #{{bookingNumber}}\n🔧 {{categoryName}}\n👤 {{workerName}}\n📅 {{scheduledAt}}\n💰 ₹{{totalAmount}}\n\nWorker jaldi confirm karega.',
  },

  worker_accepted: {
    sms:      '✅ {{workerName}} ne aapka kaam accept kiya! Phone: {{workerPhone}}. Booking: #{{bookingNumber}}',
    whatsapp: '✅ *Worker Accepted!*\n\n{{workerName}} ne aapka kaam confirm kiya.\n\n📞 Call: {{workerPhone}}\n📋 #{{bookingNumber}}',
  },

  worker_on_the_way: {
    sms:      '🚗 {{workerName}} aapke ghar aa raha hai. ETA: ~30 min. Booking: #{{bookingNumber}}',
    whatsapp: '🚗 *Worker On The Way!*\n\n{{workerName}} aa raha hai\n⏱️ ETA: ~30 min\n📞 {{workerPhone}}',
  },

  worker_arrived: {
    sms:      '📍 {{workerName}} aapke ghar pahunch gaya. Kaam shuru ho raha hai.',
    whatsapp: '📍 *Worker Arrived!*\n\n{{workerName}} aapke ghar pahunch gaya.\nKaam shuru!',
  },

  booking_completed: {
    sms:      '✅ Kaam pura! ₹{{totalAmount}} payment ready. Please {{workerName}} ko rate karein.',
    whatsapp: '✅ *Kaam Complete!*\n\n📋 #{{bookingNumber}}\n💰 Amount: ₹{{totalAmount}}\n\n⭐ Please rate {{workerName}}\nReview se workers ki income badhti hai.',
  },

  booking_cancelled: {
    sms:      '❌ Booking #{{bookingNumber}} cancel ho gayi. Reason: {{reason}}',
    whatsapp: '❌ *Booking Cancelled*\n\n📋 #{{bookingNumber}}\nReason: {{reason}}\n\nKoi help chahiye? sevasetu.app/help',
  },

  // ─── BOOKING — Worker ke liye ───
  new_job_worker: {
    sms:      '🔔 NAYA KAAM! {{categoryName}} booking. ₹{{workerPayout}} milega. Accept karo: sevasetu.app/w/{{bookingId}}',
    whatsapp: '🔔 *NAYA KAAM!*\n\n🔧 {{categoryName}}\n📍 {{location}}\n📅 {{scheduledAt}}\n💰 *₹{{workerPayout}}* milega\n\nApp mein accept karo: #{{bookingNumber}}',
  },

  job_cancelled_worker: {
    sms:      '⚠️ Booking #{{bookingNumber}} customer ne cancel kar di.',
    whatsapp: '⚠️ *Booking Cancelled*\n\nCustomer ne booking #{{bookingNumber}} cancel kar di.\nReason: {{reason}}',
  },

  // ─── PROMOTIONAL ───
  welcome: {
    sms:      '🎉 Welcome to Seva Setu! 30% OFF first booking. Code: WELCOME30',
    whatsapp: '🎉 *Welcome to Seva Setu!*\n\n_Ghar ki har zaroorat, ek app mein_\n\n🎁 First booking pe *30% OFF*\nCode: *WELCOME30*\n\n8 services available 24/7.',
  },
};

/**
 * Template render karo — variables replace karke
 *
 * @param {string} key      Template name
 * @param {string} channel  'sms' | 'whatsapp'
 * @param {Object} vars     {{name}} → value
 * @returns {string|null}
 */
const render = (key, channel, vars = {}) => {
  const template = templates[key];
  if (!template) return null;

  let message = template[channel];
  if (!message) return null;

  // Replace {{var}} with value
  Object.keys(vars).forEach((k) => {
    const regex = new RegExp(`{{${k}}}`, 'g');
    message = message.replace(regex, vars[k] ?? '');
  });

  return message;
};

module.exports = { templates, render };
