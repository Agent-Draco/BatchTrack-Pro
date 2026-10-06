const express = require('express');
const router = express.Router();
const changeCreditsController = require('../../controllers/enterprise/changeCreditsController');

router.get('/', changeCreditsController.listAll);
router.get('/customer/:phone', changeCreditsController.getCustomerCredits);

module.exports = router;
