const aiService = require('../services/ai.service');
const response = require('../utils/response');
const logger = require('../utils/logger');

module.exports = {
  recommendWorkers: async (req, res) => {
    try {
      const { categoryName, lat, lng, limit } = req.body;
      const workers = await aiService.recommendWorkers({
        categoryName,
        userLocation: lat && lng ? { lat, lng } : null,
        limit: limit || 5,
      });
      return response.success(res, 'Smart recommendations', { workers, count: workers.length });
    } catch (e) { logger.error(e); return response.serverError(res); }
  },

  recommendServices: async (req, res) => {
    try {
      const { userId } = req.body;
      const recommendations = await aiService.recommendServices({ userId });
      return response.success(res, 'Service suggestions', { recommendations });
    } catch (e) { logger.error(e); return response.serverError(res); }
  },

  predictPrice: async (req, res) => {
    try {
      const result = await aiService.predictPrice(req.body);
      if (result.error) return response.error(res, 'Category nahi mili');
      return response.success(res, 'Smart pricing', result);
    } catch (e) { logger.error(e); return response.serverError(res); }
  },

  fraudCheck: async (req, res) => {
    try {
      const result = await aiService.fraudCheck(req.body);
      return response.success(res, 'Fraud check complete', result);
    } catch (e) { logger.error(e); return response.serverError(res); }
  },

  chat: async (req, res) => {
    try {
      const { message, userId } = req.body;
      if (!message) return response.error(res, 'Message zaroori hai');
      const result = await aiService.chat({ message, userId });
      return response.success(res, 'AI reply', result);
    } catch (e) { logger.error(e); return response.serverError(res); }
  },

  insights: async (req, res) => {
    try {
      const result = await aiService.getUserInsights(req.params.userId);
      return response.success(res, 'User insights', result);
    } catch (e) { logger.error(e); return response.serverError(res); }
  },
};
