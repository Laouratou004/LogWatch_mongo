const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/performance', analyticsController.getPerformance);
router.get('/error-rate', analyticsController.getErrorRate);
router.get('/top-errors', analyticsController.getTopErrors);
router.get('/temporal', analyticsController.getTemporal);
router.get('/anomalies', analyticsController.getAnomalies);

module.exports = router;