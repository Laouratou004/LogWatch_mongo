const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

// Routes spécifiques AVANT /:id
router.get('/search', logsController.searchLogs);
router.get('/java-errors', logsController.getJavaErrors);
router.get('/web', logsController.getWebLogs);
router.get('/security', logsController.getSecurityLogs);
router.get('/slow-db', logsController.getSlowDbLogs);

// Routes CRUD
router.get('/', logsController.getLogs);
router.get('/:id', logsController.getLogById);
router.post('/', logsController.createLog);
router.delete('/:id', logsController.deleteLog);

module.exports = router;