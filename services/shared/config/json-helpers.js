/**
 * LEGACY JSON HELPERS — Used by services in JSON mode
 * Each service's database.js extends shared adapter with these helpers.
 *
 * Usage:
 *   const shared = require('../../../shared/config/database');
 *   const helpers = require('../../../shared/config/json-helpers');
 *   module.exports = { ...shared, ...helpers(DATA_DIR) };
 */

const fs   = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const ensureFile = (file) => {
  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({
      users: [], workers: [], bookings: [], categories: [],
      addresses: [], rewards: [], reviews: [], chat: [],
      payments: [], notifications: [], complaints: [],
      tracking: [], promo_codes: [], worker_skills: [],
    }, null, 2));
  }
};

module.exports = (dataDir) => {
  const file = path.join(dataDir, 'database.json');

  const read  = () => { ensureFile(file); return JSON.parse(fs.readFileSync(file, 'utf-8')); };
  const write = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

  const collection = (key) => {
    const d = read();
    if (!d[key]) d[key] = [];
    return { data: d, list: d[key] };
  };

  return {
    // ─── Generic ───
    _read:  read,
    _write: write,

    // ─── CATEGORIES ───
    getAllCategories: () => read().categories || [],
    findCategoryById: (id) => (read().categories || []).find((c) => c.id === id) || null,
    findCategoryByName: (name) => (read().categories || []).find((c) => c.name === name) || null,
    createCategory: (cat) => {
      const { data, list } = collection('categories');
      const row = { id: cat.id || uuid(), created_at: new Date().toISOString(), ...cat };
      list.push(row); write(data); return row;
    },

    // ─── WORKERS ───
    getAllWorkers:       () => read().workers || [],
    findWorkerById:      (id)    => (read().workers || []).find((w) => w.id === id) || null,
    findWorkerByPhone:   (phone) => (read().workers || []).find((w) => w.phone === phone) || null,
    createWorker: (worker) => {
      const { data, list } = collection('workers');
      const row = { id: worker.id || uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...worker };
      list.push(row); write(data); return row;
    },
    updateWorker: (id, updates) => {
      const { data, list } = collection('workers');
      const idx = list.findIndex((w) => w.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      write(data); return list[idx];
    },
    deleteWorker: (id) => {
      const { data } = collection('workers');
      data.workers = data.workers.filter((w) => w.id !== id);
      write(data); return true;
    },

    // ─── WORKER SKILLS ───
    getWorkerSkills: (workerId) => (read().worker_skills || []).filter((s) => s.worker_id === workerId),
    addWorkerSkill: (skill) => {
      const { data, list } = collection('worker_skills');
      const row = { id: skill.id || uuid(), created_at: new Date().toISOString(), ...skill };
      list.push(row); write(data); return row;
    },
    removeWorkerSkill: (id) => {
      const { data } = collection('worker_skills');
      data.worker_skills = data.worker_skills.filter((s) => s.id !== id);
      write(data); return true;
    },

    // ─── USERS ───
    getAllUsers:       () => read().users || [],
    findUserById:      (id)    => (read().users || []).find((u) => u.id === id) || null,
    findUserByPhone:   (phone) => (read().users || []).find((u) => u.phone === phone) || null,
    createUser: (user) => {
      const { data, list } = collection('users');
      const row = { id: user.id || uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...user };
      list.push(row); write(data); return row;
    },
    updateUser: (id, updates) => {
      const { data, list } = collection('users');
      const idx = list.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      write(data); return list[idx];
    },

    // ─── ADDRESSES ───
    getAddressesByUser: (userId) => (read().addresses || []).filter((a) => a.user_id === userId),
    findAddressById: (id) => (read().addresses || []).find((a) => a.id === id) || null,
    createAddress: (addr) => {
      const { data, list } = collection('addresses');
      const row = { id: addr.id || uuid(), created_at: new Date().toISOString(), ...addr };
      list.push(row); write(data); return row;
    },
    updateAddress: (id, updates) => {
      const { data, list } = collection('addresses');
      const idx = list.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      write(data); return list[idx];
    },
    deleteAddress: (id) => {
      const { data } = collection('addresses');
      data.addresses = data.addresses.filter((a) => a.id !== id);
      write(data); return true;
    },

    // ─── BOOKINGS ───
    getAllBookings:        () => read().bookings || [],
    findBookingById:       (id)  => (read().bookings || []).find((b) => b.id === id) || null,
    findBookingByNumber:   (n)   => (read().bookings || []).find((b) => b.booking_number === n) || null,
    getBookingsByUser:     (uid) => (read().bookings || []).filter((b) => b.customer_id === uid),
    getBookingsByWorker:   (wid) => (read().bookings || []).filter((b) => b.worker_id === wid),
    createBooking: (booking) => {
      const { data, list } = collection('bookings');
      const row = { id: booking.id || uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...booking };
      list.push(row); write(data); return row;
    },
    updateBooking: (id, updates) => {
      const { data, list } = collection('bookings');
      const idx = list.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      write(data); return list[idx];
    },

    // ─── REVIEWS ───
    getWorkerReviews:  (workerId) => (read().reviews || []).filter((r) => r.worker_id === workerId),
    getBookingReview:  (bookingId) => (read().reviews || []).find((r) => r.booking_id === bookingId) || null,
    createReview: (review) => {
      const { data, list } = collection('reviews');
      const row = { id: review.id || uuid(), created_at: new Date().toISOString(), ...review };
      list.push(row); write(data); return row;
    },

    // ─── PAYMENTS ───
    getAllPayments: () => read().payments || [],
    findPaymentById: (id) => (read().payments || []).find((p) => p.id === id) || null,
    getPaymentsByBooking: (bid) => (read().payments || []).filter((p) => p.booking_id === bid),
    createPayment: (payment) => {
      const { data, list } = collection('payments');
      const row = { id: payment.id || uuid(), created_at: new Date().toISOString(), ...payment };
      list.push(row); write(data); return row;
    },
    updatePayment: (id, updates) => {
      const { data, list } = collection('payments');
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      write(data); return list[idx];
    },

    // ─── NOTIFICATIONS ───
    getNotificationsByUser: (userId) => (read().notifications || []).filter((n) => n.user_id === userId),
    createNotification: (notif) => {
      const { data, list } = collection('notifications');
      const row = { id: notif.id || uuid(), created_at: new Date().toISOString(), ...notif };
      list.push(row); write(data); return row;
    },
    markNotificationRead: (id) => {
      const { data, list } = collection('notifications');
      const idx = list.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      list[idx].is_read = true;
      write(data); return list[idx];
    },

    // ─── CHAT ───
    getChatMessages: (bookingId) => (read().chat || []).filter((m) => m.booking_id === bookingId),
    createChatMessage: (msg) => {
      const { data, list } = collection('chat');
      const row = { id: msg.id || uuid(), created_at: new Date().toISOString(), ...msg };
      list.push(row); write(data); return row;
    },

    // ─── TRACKING ───
    getTracking: (bookingId) => (read().tracking || []).find((t) => t.booking_id === bookingId) || null,
    upsertTracking: (bookingId, location) => {
      const { data, list } = collection('tracking');
      const idx = list.findIndex((t) => t.booking_id === bookingId);
      if (idx === -1) {
        list.push({ id: uuid(), booking_id: bookingId, ...location, updated_at: new Date().toISOString() });
      } else {
        list[idx] = { ...list[idx], ...location, updated_at: new Date().toISOString() };
      }
      write(data); return true;
    },

    // ─── COMPLAINTS ───
    getAllComplaints: () => read().complaints || [],
    createComplaint: (c) => {
      const { data, list } = collection('complaints');
      const row = { id: c.id || uuid(), created_at: new Date().toISOString(), ...c };
      list.push(row); write(data); return row;
    },

    // ─── PROMO CODES ───
    getPromoCode: (code) => (read().promo_codes || []).find((p) => p.code === code) || null,
  };
};
