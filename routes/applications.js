// =============================================================================
// routes/applications.js — URL du domaine "applications"
// -----------------------------------------------------------------------------
// Routes prefixees par "/api/applications". CRUD complet sur les 10
// applications surveillees.
// =============================================================================

const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');

router.get('/', applicationsController.getApplications);          // Liste des applications (tri par nom)
router.post('/', applicationsController.createApplication);       // Ajouter une nouvelle application
router.put('/:id', applicationsController.updateApplication);     // Modifier une application existante
router.delete('/:id', applicationsController.deleteApplication);  // Supprimer une application

module.exports = router;
