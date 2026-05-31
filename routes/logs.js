// =============================================================================
// routes/logs.js — Definitions des URL du domaine "logs"
// -----------------------------------------------------------------------------
// Toutes ces routes sont prefixees par "/api/logs" (defini dans server.js).
// Chaque route mappe une METHODE + URL vers une fonction du controller.
// =============================================================================

const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

// --- IMPORTANT : ordre des routes ---
// Express teste les routes DANS L'ORDRE DE DECLARATION.
// Si on declare "/:id" AVANT "/search", alors une requete GET /api/logs/search
// va matcher "/:id" avec id = "search" -> bug !
// On declare donc TOUJOURS les routes specifiques (URL fixe) AVANT les routes
// avec parametre (:id).

// --- Routes specifiques (URL fixe) ---
router.get('/search', logsController.searchLogs);           // GET /api/logs/search?q=...&level=...
router.get('/java-errors', logsController.getJavaErrors);   // GET /api/logs/java-errors  ($exists: stack_trace)
router.get('/web', logsController.getWebLogs);              // GET /api/logs/web          ($exists: methode_http)
router.get('/security', logsController.getSecurityLogs);    // GET /api/logs/security     ($exists: user)
router.get('/slow-db', logsController.getSlowDbLogs);       // GET /api/logs/slow-db      ($exists: requete_sql + duree > 1s)

// --- Routes CRUD generiques ---
router.get('/', logsController.getLogs);            // GET    /api/logs           -> liste paginee
router.get('/:id', logsController.getLogById);      // GET    /api/logs/abc123    -> detail
router.post('/', logsController.createLog);         // POST   /api/logs           -> creation (body JSON)
router.delete('/:id', logsController.deleteLog);    // DELETE /api/logs/abc123    -> suppression

module.exports = router;
