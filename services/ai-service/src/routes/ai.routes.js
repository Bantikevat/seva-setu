const express = require('express');
const router = express.Router();
const c = require('../controllers/ai.controller');

router.post('/recommend-workers',  c.recommendWorkers);
router.post('/recommend-services', c.recommendServices);
router.post('/predict-price',      c.predictPrice);
router.post('/fraud-check',        c.fraudCheck);
router.post('/chat',               c.chat);
router.get('/insights/:userId',    c.insights);

module.exports = router;
