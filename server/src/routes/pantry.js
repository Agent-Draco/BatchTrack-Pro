const express = require('express');
const pantryController = require('../controllers/pantryController');

const router = express.Router();

router.post('/scan', pantryController.scan);

module.exports = router;
