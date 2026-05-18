/**
 * COUPON SERVICE
 * Discount codes, promos
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const dbPath = path.join(__dirname, '../../../auth-service/data/database.json');

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Default coupons (would be in DB in production)
const DEFAULT_COUPONS = [
  { code: 'WELCOME30',  type: 'percent', value: 30, maxDiscount: 200, minOrder: 200, description: 'First booking - 30% off (max ₹200)', firstTimeOnly: true,  active: true },
  { code: 'SEVA50',     type: 'flat',    value: 50,  maxDiscount: 50,  minOrder: 300, description: 'Flat ₹50 off',                  firstTimeOnly: false, active: true },
  { code: 'PLUMBER10',  type: 'percent', value: 10,  maxDiscount: 100, minOrder: 250, description: '10% off Plumber service',       firstTimeOnly: false, active: true, category: 'Plumber' },
  { code: 'WEEKEND20',  type: 'percent', value: 20,  maxDiscount: 150, minOrder: 300, description: '20% off on weekends',           firstTimeOnly: false, active: true },
  { code: 'AC100',      type: 'flat',    value: 100, maxDiscount: 100, minOrder: 499, description: '₹100 off on AC repair',         firstTimeOnly: false, active: true, category: 'AC Repair' },
];

const initCoupons = () => {
  const db = readDb();
  if (!db.coupons || db.coupons.length === 0) {
    db.coupons = DEFAULT_COUPONS.map((c) => ({ ...c, created_at: new Date().toISOString(), usage_count: 0 }));
    writeDb(db);
  }
};

const couponService = {
  /**
   * List all active coupons
   */
  listActive: () => {
    initCoupons();
    const db = readDb();
    return (db.coupons || []).filter((c) => c.active);
  },

  /**
   * Validate and calculate discount
   */
  applyCoupon: (code, orderAmount, customerId, category) => {
    initCoupons();
    const db = readDb();
    const coupon = (db.coupons || []).find((c) =>
      c.code.toUpperCase() === code.toUpperCase() && c.active
    );

    if (!coupon) return { error: 'INVALID_COUPON' };

    if (orderAmount < coupon.minOrder) {
      return { error: 'MIN_ORDER_NOT_MET', minOrder: coupon.minOrder };
    }

    if (coupon.category && coupon.category !== category) {
      return { error: 'CATEGORY_MISMATCH', validFor: coupon.category };
    }

    if (coupon.firstTimeOnly) {
      const userBookings = (db.bookings || []).filter((b) => b.customer_id === customerId);
      if (userBookings.length > 0) {
        return { error: 'NOT_FIRST_TIME' };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((orderAmount * coupon.value) / 100);
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
    }

    // Cap at maxDiscount
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    const finalAmount = orderAmount - discount;

    return {
      coupon: coupon.code,
      description: coupon.description,
      discount,
      originalAmount: orderAmount,
      finalAmount,
    };
  },

  /**
   * Mark coupon as used
   */
  recordUsage: (code) => {
    const db = readDb();
    const index = (db.coupons || []).findIndex((c) =>
      c.code.toUpperCase() === code.toUpperCase()
    );
    if (index !== -1) {
      db.coupons[index].usage_count = (db.coupons[index].usage_count || 0) + 1;
      writeDb(db);
    }
  },
};

module.exports = couponService;
