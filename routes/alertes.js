const express = require('express');
const router = express.Router();
const alertesController = require('../controllers/alertesController');

router.get('/', alertesController.getAlertes);
router.put('/:id/resoudre', alertesController.resoudreAlerte);
router.delete('/:id', alertesController.deleteAlerte);

module.exports = router;