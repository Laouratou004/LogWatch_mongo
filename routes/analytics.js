// =============================================================================
// routes/analytics.js — URL des analyses statistiques (les 4 pipelines)
// -----------------------------------------------------------------------------
// Routes prefixees par "/api/analytics". Toutes ces routes lancent un
// "pipeline d'agregation" MongoDB (succession d'etapes $match, $group, $sort...)
// Ce sont LES routes qui prouvent au prof qu'on sait utiliser MongoDB pour
// l'analyse de donnees.
// =============================================================================

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/performance', analyticsController.getPerformance);   // Mesure explain() : verifie que les index sont utilises
router.get('/error-rate', analyticsController.getErrorRate);      // Pipeline 1 : Taux d'erreur par application
router.get('/top-errors', analyticsController.getTopErrors);      // Pipeline 2 : Top 10 des erreurs les plus frequentes
router.get('/temporal', analyticsController.getTemporal);         // Pipeline 3 : Distribution horaire des logs
router.get('/anomalies', analyticsController.getAnomalies);       // Pipeline 4 : Detection d'anomalies (equivalent HAVING SQL)

module.exports = router;
