require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3006,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  jwtSecret: process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',

  // Razorpay
  razorpayKeyId:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_dev_key',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'dev_secret',
};
