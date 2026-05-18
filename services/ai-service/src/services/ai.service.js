/**
 * AI SERVICE — Smart Logic
 * -------------------------------------------------
 * Dev: Heuristics-based (smart rules)
 * Prod: Real ML + Claude API
 */

const db = require('../config/database');
const logger = require('../utils/logger');

// Haversine distance
const toRad = (deg) => deg * Math.PI / 180;
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
};

const aiService = {
  /**
   * SMART WORKER RECOMMENDATION
   * Multi-factor scoring:
   *   - Rating (40%)
   *   - Experience (20%)
   *   - Distance (20%)
   *   - Availability (10%)
   *   - Verified (10%)
   */
  recommendWorkers: async ({ categoryName, userLocation, limit = 5 }) => {
    let workers = db.getAllWorkers().filter((w) => w.is_active);

    if (categoryName) {
      const category = db.getAllCategories().find((c) =>
        c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        const data = require('fs').readFileSync(require('path').join(__dirname, '../../../auth-service/data/database.json'), 'utf-8');
        const allDb = JSON.parse(data);
        const skills = (allDb.worker_skills || []).filter((s) => s.category_id === category.id);
        const ids = skills.map((s) => s.worker_id);
        workers = workers.filter((w) => ids.includes(w.id));
      }
    }

    // Score each worker
    const scored = workers.map((w) => {
      const distance = userLocation?.lat && userLocation?.lng && w.latitude && w.longitude
        ? getDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude)
        : null;

      // Calculate score (0-100)
      let score = 0;
      score += (w.rating_average / 5) * 40;        // 40% rating
      score += Math.min(w.total_jobs / 200, 1) * 20; // 20% experience
      score += (distance !== null ? Math.max(0, 1 - distance / 10) : 0.5) * 20; // 20% distance
      score += w.is_available ? 10 : 0;            // 10% available
      score += w.is_verified ? 10 : 0;             // 10% verified

      // Generate AI reasoning
      const reasons = [];
      if (w.rating_average >= 4.8) reasons.push('⭐ Top rated');
      if (w.total_jobs >= 200)     reasons.push('🏆 Very experienced');
      if (distance !== null && distance < 2) reasons.push('📍 Bahut paas hai');
      if (w.is_available)          reasons.push('● Available now');
      if (w.is_verified)           reasons.push('✓ Verified');

      return {
        id:            w.id,
        name:          w.name,
        rating:        w.rating_average,
        totalJobs:     w.total_jobs,
        isVerified:    w.is_verified,
        isAvailable:   w.is_available,
        distanceKm:    distance,
        aiScore:       Math.round(score),
        aiReasons:     reasons,
      };
    });

    scored.sort((a, b) => b.aiScore - a.aiScore);
    logger.ai(`Recommended ${Math.min(limit, scored.length)} workers for "${categoryName}"`);
    return scored.slice(0, limit);
  },

  /**
   * SERVICE RECOMMENDATIONS — based on time, season, history
   */
  recommendServices: async ({ userId }) => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const hour  = now.getHours();

    const recommendations = [];

    // Seasonal logic
    if (month >= 2 && month <= 5) {
      // March-June: Summer
      recommendations.push({
        category: 'AC Repair',
        emoji: '❄️',
        reason: 'Garmi aa rahi hai — AC service karwao',
        priority: 'high',
      });
    }
    if (month >= 5 && month <= 8) {
      // June-September: Monsoon
      recommendations.push({
        category: 'Plumber',
        emoji: '🔧',
        reason: 'Monsoon mein leakage check karwao',
        priority: 'high',
      });
    }
    if (month >= 8 && month <= 10) {
      // Sept-Nov: Festival season
      recommendations.push({
        category: 'Cleaning',
        emoji: '🧹',
        reason: 'Diwali ki tayyari — deep cleaning',
        priority: 'high',
      });
      recommendations.push({
        category: 'Painter',
        emoji: '🎨',
        reason: 'Festive ghar paint karwao',
        priority: 'medium',
      });
    }

    // User history based
    const userBookings = db.getBookingsByCustomer(userId);
    if (userBookings.length === 0) {
      recommendations.push({
        category: 'Cleaning',
        emoji: '🧹',
        reason: 'First time? Cleaning se shuru karo — ₹249 only',
        priority: 'medium',
      });
    } else {
      // Find most-booked category
      const counts = {};
      userBookings.forEach((b) => {
        counts[b.category_name] = (counts[b.category_name] || 0) + 1;
      });
      const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        recommendations.push({
          category: topCat[0],
          emoji: '🔄',
          reason: `Aapne pehle ${topCat[1]} baar book kiya hai`,
          priority: 'low',
        });
      }
    }

    // Time-based
    if (hour >= 6 && hour <= 10) {
      recommendations.push({
        category: 'Cook',
        emoji: '👨‍🍳',
        reason: 'Breakfast / lunch banwane wala chahiye?',
        priority: 'low',
      });
    }

    logger.ai(`Generated ${recommendations.length} service recommendations`);
    return recommendations.slice(0, 4);
  },

  /**
   * PRICE PREDICTION — Dynamic pricing
   */
  predictPrice: async ({ categoryName, hour, day }) => {
    const category = db.getAllCategories().find((c) =>
      c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) return { error: 'CATEGORY_NOT_FOUND' };

    const basePrice = category.base_price;
    let multiplier = 1.0;
    let factors = [];

    // Peak hours (7-10 AM, 5-9 PM)
    const currentHour = hour ?? new Date().getHours();
    if ((currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 21)) {
      multiplier *= 1.15;
      factors.push({ name: 'Peak hours', adjustment: '+15%' });
    }

    // Weekend
    const currentDay = day ?? new Date().getDay();
    if (currentDay === 0 || currentDay === 6) {
      multiplier *= 1.1;
      factors.push({ name: 'Weekend', adjustment: '+10%' });
    }

    // Late night / early morning premium
    if (currentHour < 6 || currentHour > 22) {
      multiplier *= 1.3;
      factors.push({ name: 'Late night', adjustment: '+30%' });
    }

    const finalPrice = Math.round(basePrice * multiplier);
    return {
      basePrice,
      finalPrice,
      multiplier: Math.round(multiplier * 100) / 100,
      factors,
      savings: finalPrice < basePrice ? basePrice - finalPrice : 0,
    };
  },

  /**
   * FRAUD CHECK — Heuristic-based
   */
  fraudCheck: async ({ customerId, amount, workerId }) => {
    const flags = [];
    let riskScore = 0;

    const userBookings = db.getBookingsByCustomer(customerId);

    // Too many bookings in last hour
    const oneHourAgo = Date.now() - 3600 * 1000;
    const recentBookings = userBookings.filter((b) =>
      new Date(b.created_at).getTime() > oneHourAgo
    );
    if (recentBookings.length > 3) {
      flags.push('Too many bookings in last hour');
      riskScore += 30;
    }

    // High amount on first booking
    if (userBookings.length === 0 && amount > 1500) {
      flags.push('High amount on first booking');
      riskScore += 20;
    }

    // Multiple cancellations
    const cancelled = userBookings.filter((b) => b.status === 'cancelled').length;
    if (cancelled > 5) {
      flags.push('Multiple cancellations history');
      riskScore += 25;
    }

    const verdict = riskScore < 20 ? 'safe' : riskScore < 50 ? 'review' : 'block';

    return {
      verdict,
      riskScore,
      flags,
      message: verdict === 'safe' ? 'Booking safe hai' :
               verdict === 'review' ? 'Manual review zaroori' :
               'Booking block — high risk',
    };
  },

  /**
   * CHAT BOT — Simple Q&A
   */
  chat: async ({ message, userId }) => {
    const lower = message.toLowerCase();

    // Simple intent matching
    if (lower.includes('book') || lower.includes('booking')) {
      return {
        reply: '📋 Booking karne ke liye home screen pe category select karo, phir worker choose karke "Book Now" pe click karo. Easy!',
        suggestions: ['View categories', 'My bookings', 'Help'],
      };
    }

    if (lower.includes('cancel')) {
      return {
        reply: '❌ Booking cancel karne ke liye — Bookings tab kholo, booking pe click karo, "Cancel Booking" button milega. Free cancellation pending stage tak.',
        suggestions: ['My bookings'],
      };
    }

    if (lower.includes('payment') || lower.includes('refund')) {
      return {
        reply: '💳 Payment ke liye Booking Details mein "Pay Now" button milega. UPI, Card, Net Banking — sab support hai. Refund 5-7 din mein.',
        suggestions: ['Payment history'],
      };
    }

    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
      return {
        reply: '💰 Pricing transparent hai. Plumber ₹299, Electrician ₹349, Cleaning ₹249. Peak hours mein thoda extra. Categories tab mein full list dekho.',
        suggestions: ['Show categories'],
      };
    }

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return {
        reply: '👋 Namaste! Main Seva Setu ka AI helper hoon. Kya help chahiye? Booking, cancellation, payment, ya kuch aur?',
        suggestions: ['Book a service', 'My bookings', 'Help'],
      };
    }

    return {
      reply: 'Main aapki help kar sakta hoon booking, payment, cancellation, ya pricing ke baare mein. Aur kuch puchhna ho toh "Help" pe click karo!',
      suggestions: ['Book a service', 'My bookings', 'Cancel booking', 'Payment'],
    };
  },

  /**
   * USER INSIGHTS — Dashboard data
   */
  getUserInsights: async (userId) => {
    const bookings = db.getBookingsByCustomer(userId);

    const totalBookings = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const totalSpent = bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);

    // Favorite category
    const counts = {};
    bookings.forEach((b) => { counts[b.category_name] = (counts[b.category_name] || 0) + 1; });
    const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalBookings,
      completed,
      cancelled,
      totalSpent,
      favoriteCategory: favorite ? favorite[0] : null,
      memberSince: bookings.length > 0
        ? new Date(bookings[bookings.length - 1].created_at).toISOString()
        : null,
    };
  },
};

module.exports = aiService;
