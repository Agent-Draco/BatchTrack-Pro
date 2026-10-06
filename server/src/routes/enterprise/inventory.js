const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/enterprise/inventoryController');

router.get('/', inventoryController.getTree);
router.get('/movements', inventoryController.getMovements);
router.post('/adjust', inventoryController.adjustStock);

module.exports = router;
