// =============================================================================
// routes/alertes.js — URL du domaine "alertes"
// -----------------------------------------------------------------------------
// Routes prefixees par "/api/alertes". Pas de POST : les alertes sont creees
// automatiquement par le pipeline d'anomalies (analyticsController.getAnomalies).
// =============================================================================

const express = require('express');
const router = express.Router();
const alertesController = require('../controllers/alertesController');

router.get('/', alertesController.getAlertes);                    // Liste (non resolues en premier)
router.put('/:id/resoudre', alertesController.resoudreAlerte);    // Marquer une alerte comme resolue
router.delete('/:id', alertesController.deleteAlerte);            // Supprimer une alerte

module.exports = router;
