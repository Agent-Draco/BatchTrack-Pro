const express = require('express');
const transactionsController = require('../controllers/transactionsController');

const router = express.Router();

router.get('/', transactionsController.list);
router.post('/', transactionsController.create);

module.exports = router;
