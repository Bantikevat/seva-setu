require('dotenv').config();
module.exports = {
  port: parseInt(process.env.PORT) || 3007,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
