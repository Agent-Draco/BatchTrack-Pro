const express = require('express');
const router = express.Router();
const posCheckoutController = require('../../controllers/pos/posCheckoutController');

router.post('/', posCheckoutController.checkout);

module.exports = router;
