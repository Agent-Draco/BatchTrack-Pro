const express = require('express');
const router = express.Router();
const posReturnsController = require('../../controllers/pos/posReturnsController');

router.post('/', posReturnsController.initiateReturn);

module.exports = router;
