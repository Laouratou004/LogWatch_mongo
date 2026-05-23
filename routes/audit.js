const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/top-ips', analyticsController.getTopIps);
router.get('/users', analyticsController.getUsersSuspects);

module.exports = router;