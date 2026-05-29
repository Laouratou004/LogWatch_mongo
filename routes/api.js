const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Routes Générales
router.get('/stats', logController.getStats);
router.get('/logs', logController.getLogs);
router.get('/alertes', logController.getAlertes);

// Pipelines d'agrégation (Slide 5)
router.get('/analytics/taux-erreur', logController.getTauxErreur);
router.get('/analytics/top-erreurs', logController.getTopErreurs);
router.get('/analytics/distribution', logController.getDistributionTemporelle);
router.get('/analytics/anomalies', logController.getAnomalies);

module.exports = router;
