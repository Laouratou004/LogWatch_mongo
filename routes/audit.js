// =============================================================================
// routes/audit.js — URL des analyses de securite
// -----------------------------------------------------------------------------
// Routes prefixees par "/api/audit". Ces deux routes detectent des
// comportements suspects dans les logs de securite (echecs de connexion,
// tentatives massives) en se basant sur le champ "user" et "succes".
// =============================================================================

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/top-ips', analyticsController.getTopIps);            // Top 10 des adresses IP avec le plus d'echecs
router.get('/users', analyticsController.getUsersSuspects);       // Utilisateurs avec plus de 5 tentatives

module.exports = router;
