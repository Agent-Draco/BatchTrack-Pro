const express = require('express');
const router = express.Router();
const salvageController = require('../../controllers/enterprise/salvageController');

router.get('/', salvageController.getIntelligence);
router.post('/tickets', salvageController.createTicket);
router.patch('/tickets/:id', salvageController.updateTicket);

module.exports = router;
