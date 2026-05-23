const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');

router.get('/', applicationsController.getApplications);
router.post('/', applicationsController.createApplication);
router.put('/:id', applicationsController.updateApplication);
router.delete('/:id', applicationsController.deleteApplication);

module.exports = router;