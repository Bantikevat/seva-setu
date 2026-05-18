/**
 * REWARDS SERVICE — Referral + Loyalty Points
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const dbPath = path.join(__dirname, '../../../auth-service/data/database.json');

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const REWARD_CONFIG = {
  signupBonus:        100,    // 100 points on signup
  referralReward:     200,    // 200 points when referee signs up
  referralFirstBooking: 300,  // 300 points when referee books first time
  bookingPoints:      10,     // 10 points per ₹100 spent
  pointsToRupees:     0.1,    // 1 point = ₹0.10 (10 points = ₹1)
};

/**
 * Generate unique referral code from user
 */
const generateReferralCode = (userId, phone) => {
  return 'SEVA' + phone.substring(6) + userId.substring(0, 3).toUpperCase();
};

const rewardsService = {
  /**
   * Initialize user rewards (called on signup)
   */
  initRewards: (userId, phone) => {
    const db = readDb();
    if (!db.rewards) db.rewards = [];

    const existing = db.rewards.find((r) => r.user_id === userId);
    if (existing) return existing;

    const reward = {
      id:              uuidv4(),
      user_id:         userId,
      referral_code:   generateReferralCode(userId, phone),
      points:          REWARD_CONFIG.signupBonus,
      lifetime_points: REWARD_CONFIG.signupBonus,
      referrals_count: 0,
      referred_by:     null,
      transactions: [
        {
          type: 'signup_bonus',
          points: REWARD_CONFIG.signupBonus,
          description: 'Welcome bonus 🎉',
          date: new Date().toISOString(),
        },
      ],
      created_at:      new Date().toISOString(),
    };

    db.rewards.push(reward);
    writeDb(db);
    return reward;
  },

  /**
   * Get user rewards data
   */
  getUserRewards: (userId, phone) => {
    const db = readDb();
    if (!db.rewards) db.rewards = [];

    let reward = db.rewards.find((r) => r.user_id === userId);
    if (!reward) {
      reward = rewardsService.initRewards(userId, phone);
    }

    return {
      points:          reward.points,
      lifetimePoints:  reward.lifetime_points,
      referralCode:    reward.referral_code,
      referralsCount:  reward.referrals_count,
      rupeesValue:     Math.round(reward.points * REWARD_CONFIG.pointsToRupees),
      transactions:    reward.transactions.slice(-20).reverse(),
    };
  },

  /**
   * Apply referral code (when new user signs up)
   */
  applyReferral: (newUserId, referralCode) => {
    const db = readDb();
    if (!db.rewards) db.rewards = [];

    const referrer = db.rewards.find((r) =>
      r.referral_code.toUpperCase() === referralCode.toUpperCase()
    );

    if (!referrer) return { error: 'INVALID_CODE' };
    if (referrer.user_id === newUserId) return { error: 'CANNOT_REFER_SELF' };

    // Reward the referrer
    const refIndex = db.rewards.findIndex((r) => r.user_id === referrer.user_id);
    db.rewards[refIndex].points += REWARD_CONFIG.referralReward;
    db.rewards[refIndex].lifetime_points += REWARD_CONFIG.referralReward;
    db.rewards[refIndex].referrals_count += 1;
    db.rewards[refIndex].transactions.push({
      type: 'referral_bonus',
      points: REWARD_CONFIG.referralReward,
      description: 'Friend signed up via your code',
      date: new Date().toISOString(),
    });

    // Mark new user as referred
    const newIndex = db.rewards.findIndex((r) => r.user_id === newUserId);
    if (newIndex !== -1) {
      db.rewards[newIndex].referred_by = referrer.user_id;
      // Give bonus to new user too
      db.rewards[newIndex].points += 100;
      db.rewards[newIndex].lifetime_points += 100;
      db.rewards[newIndex].transactions.push({
        type: 'referred_bonus',
        points: 100,
        description: 'Bonus for using referral code',
        date: new Date().toISOString(),
      });
    }

    writeDb(db);
    return { success: true, reward: REWARD_CONFIG.referralReward };
  },

  /**
   * Add loyalty points (after booking complete)
   */
  addBookingPoints: (userId, orderAmount, bookingNumber) => {
    const db = readDb();
    if (!db.rewards) return null;

    const index = db.rewards.findIndex((r) => r.user_id === userId);
    if (index === -1) return null;

    const points = Math.floor(orderAmount / 100) * REWARD_CONFIG.bookingPoints;

    db.rewards[index].points += points;
    db.rewards[index].lifetime_points += points;
    db.rewards[index].transactions.push({
      type: 'booking_reward',
      points,
      description: `Earned for #${bookingNumber}`,
      date: new Date().toISOString(),
    });

    writeDb(db);
    return { points };
  },

  /**
   * Redeem points (use at checkout)
   */
  redeemPoints: (userId, pointsToRedeem) => {
    const db = readDb();
    const index = (db.rewards || []).findIndex((r) => r.user_id === userId);
    if (index === -1) return { error: 'USER_NOT_FOUND' };

    if (db.rewards[index].points < pointsToRedeem) {
      return { error: 'INSUFFICIENT_POINTS', available: db.rewards[index].points };
    }

    db.rewards[index].points -= pointsToRedeem;
    db.rewards[index].transactions.push({
      type: 'redemption',
      points: -pointsToRedeem,
      description: `Redeemed for ₹${Math.round(pointsToRedeem * REWARD_CONFIG.pointsToRupees)}`,
      date: new Date().toISOString(),
    });

    writeDb(db);
    return {
      success: true,
      pointsRedeemed: pointsToRedeem,
      discount: Math.round(pointsToRedeem * REWARD_CONFIG.pointsToRupees),
      remaining: db.rewards[index].points,
    };
  },

  config: REWARD_CONFIG,
};

module.exports = rewardsService;
