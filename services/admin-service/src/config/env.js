require('dotenv').config();
module.exports = {
  port: parseInt(process.env.PORT) || 3008,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  // Simple admin password (production: use proper RBAC)
  adminPassword: process.env.ADMIN_PASSWORD || 'seva-admin-2026',
};
