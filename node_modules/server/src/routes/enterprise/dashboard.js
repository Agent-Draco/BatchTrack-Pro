const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/enterprise/dashboardController');

router.get('/', dashboardController.getDashboard);

module.exports = router;
