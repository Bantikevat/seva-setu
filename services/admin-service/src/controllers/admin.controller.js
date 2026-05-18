/**
 * ADMIN CONTROLLER — All admin operations
 */

const db = require('../config/database');
const logger = require('../utils/logger');

const ok = (res, msg, data = {}) => res.json({ success: true, message: msg, data });
const err = (res, msg, status = 400) => res.status(status).json({ success: false, message: msg });

module.exports = {
  /**
   * GET /admin/dashboard
   * Complete dashboard stats
   */
  dashboard: (req, res) => {
    try {
      const d = db.readDb();
      const users     = d.users || [];
      const workers   = d.workers || [];
      const bookings  = d.bookings || [];
      const payments  = d.payments || [];
      const categories= d.categories || [];

      // Revenue calculations
      const totalRevenue   = payments.filter((p) => p.status === 'captured').reduce((s, p) => s + p.amount, 0);
      const platformProfit = payments.filter((p) => p.status === 'captured').reduce((s, p) => s + (p.platform_fee || 0), 0);
      const workerPayouts  = payments.filter((p) => p.status === 'captured').reduce((s, p) => s + (p.worker_payout || 0), 0);

      // Status breakdown
      const statusCounts = {};
      bookings.forEach((b) => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });

      // Recent activity
      const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      const recentUsers = [...users]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Top workers
      const topWorkers = [...workers]
        .sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0))
        .slice(0, 5);

      // Category popularity
      const catCounts = {};
      bookings.forEach((b) => { catCounts[b.category_name] = (catCounts[b.category_name] || 0) + 1; });
      const topCategories = Object.entries(catCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Pending verifications
      const pendingWorkers = workers.filter((w) => !w.is_verified).length;

      return ok(res, 'Dashboard data', {
        counts: {
          users:      users.length,
          workers:    workers.length,
          bookings:   bookings.length,
          payments:   payments.length,
          categories: categories.length,
          pendingVerification: pendingWorkers,
        },
        revenue: {
          total:    totalRevenue,
          profit:   platformProfit,
          payouts:  workerPayouts,
          avgOrderValue: bookings.length > 0 ? Math.round(totalRevenue / Math.max(bookings.length, 1)) : 0,
        },
        statusCounts,
        recentBookings,
        recentUsers,
        topWorkers,
        topCategories,
      });
    } catch (e) {
      logger.error('dashboard error:', e.message);
      return err(res, 'Server error', 500);
    }
  },

  /**
   * GET /admin/users
   */
  listUsers: (req, res) => {
    const d = db.readDb();
    const users = (d.users || []).map((u) => {
      const userBookings = (d.bookings || []).filter((b) => b.customer_id === u.id);
      const totalSpent = userBookings
        .filter((b) => b.payment_status === 'paid')
        .reduce((s, b) => s + b.total_amount, 0);

      return {
        id:           u.id,
        phone:        u.phone,
        name:         u.name,
        email:        u.email,
        profilePhoto: u.profile_photo,
        isActive:     u.is_active,
        bookings:     userBookings.length,
        spent:        totalSpent,
        joinedAt:     u.created_at,
      };
    });

    return ok(res, 'Users list', { users, total: users.length });
  },

  /**
   * PUT /admin/users/:id
   */
  updateUser: (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return err(res, 'User not found', 404);
    logger.admin(`User updated: ${req.params.id}`);
    return ok(res, 'User updated', updated);
  },

  /**
   * GET /admin/workers
   */
  listWorkers: (req, res) => {
    const d = db.readDb();
    const skills = d.worker_skills || [];
    const categories = d.categories || [];

    const workers = (d.workers || []).map((w) => {
      const workerSkills = skills.filter((s) => s.worker_id === w.id);
      const primarySkill = workerSkills.find((s) => s.is_primary) || workerSkills[0];
      const category = primarySkill ? categories.find((c) => c.id === primarySkill.category_id) : null;

      const workerBookings = (d.bookings || []).filter((b) => b.worker_id === w.id);
      const earnings = workerBookings
        .filter((b) => b.payment_status === 'paid')
        .reduce((s, b) => s + (b.worker_payout || 0), 0);

      return {
        id:             w.id,
        phone:          w.phone,
        name:           w.name,
        bio:            w.bio,
        profilePhoto:   w.profile_photo,
        aadhaarUrl:     w.aadhaar_url,
        skill:          category?.name || 'Unassigned',
        skillEmoji:     category?.emoji || '🔧',
        rating:         w.rating_average,
        totalJobs:      w.total_jobs,
        isVerified:     w.is_verified,
        isAvailable:    w.is_available,
        isActive:       w.is_active,
        joinedAt:       w.joined_at,
        earnings,
      };
    });

    return ok(res, 'Workers list', {
      workers,
      total: workers.length,
      verified: workers.filter((w) => w.isVerified).length,
      pending:  workers.filter((w) => !w.isVerified).length,
    });
  },

  /**
   * PUT /admin/workers/:id/verify
   */
  verifyWorker: (req, res) => {
    const updated = db.updateWorker(req.params.id, { is_verified: true });
    if (!updated) return err(res, 'Worker not found', 404);
    logger.admin(`Worker verified: ${updated.name}`);
    return ok(res, `${updated.name} verified successfully!`, updated);
  },

  /**
   * PUT /admin/workers/:id/toggle-active
   */
  toggleWorkerActive: (req, res) => {
    const d = db.readDb();
    const worker = (d.workers || []).find((w) => w.id === req.params.id);
    if (!worker) return err(res, 'Not found', 404);

    const updated = db.updateWorker(req.params.id, { is_active: !worker.is_active });
    logger.admin(`Worker ${updated.is_active ? 'activated' : 'suspended'}: ${updated.name}`);
    return ok(res, `${updated.name} ${updated.is_active ? 'activated' : 'suspended'}`, updated);
  },

  /**
   * GET /admin/bookings
   */
  listBookings: (req, res) => {
    const d = db.readDb();
    const { status } = req.query;

    let bookings = d.bookings || [];
    if (status) bookings = bookings.filter((b) => b.status === status);

    bookings = [...bookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return ok(res, 'Bookings', { bookings, total: bookings.length });
  },

  /**
   * GET /admin/payments
   */
  listPayments: (req, res) => {
    const d = db.readDb();
    const payments = [...(d.payments || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const summary = {
      total:    payments.length,
      captured: payments.filter((p) => p.status === 'captured').length,
      pending:  payments.filter((p) => p.status === 'pending').length,
      failed:   payments.filter((p) => p.status === 'failed').length,
      refunded: payments.filter((p) => p.status === 'refunded').length,
      revenue:  payments.filter((p) => p.status === 'captured').reduce((s, p) => s + p.amount, 0),
      profit:   payments.filter((p) => p.status === 'captured').reduce((s, p) => s + (p.platform_fee || 0), 0),
    };

    return ok(res, 'Payments', { payments, summary });
  },

  /**
   * GET /admin/coupons
   */
  listCoupons: (req, res) => {
    const d = db.readDb();
    return ok(res, 'Coupons', { coupons: d.coupons || [] });
  },

  /**
   * POST /admin/coupons
   */
  createCoupon: (req, res) => {
    const d = db.readDb();
    if (!d.coupons) d.coupons = [];
    const newCoupon = {
      ...req.body,
      created_at: new Date().toISOString(),
      usage_count: 0,
      active: true,
    };
    d.coupons.push(newCoupon);
    db.writeDb(d);
    logger.admin(`Coupon created: ${newCoupon.code}`);
    return ok(res, 'Coupon created', newCoupon, 201);
  },

  /**
   * PUT /admin/coupons/:code/toggle
   */
  toggleCoupon: (req, res) => {
    const d = db.readDb();
    const i = (d.coupons || []).findIndex((c) => c.code === req.params.code);
    if (i === -1) return err(res, 'Not found', 404);
    d.coupons[i].active = !d.coupons[i].active;
    db.writeDb(d);
    return ok(res, `Coupon ${d.coupons[i].active ? 'enabled' : 'disabled'}`, d.coupons[i]);
  },
};
