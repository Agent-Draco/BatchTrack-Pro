const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/:id/products', usersController.getProducts);

module.exports = router;
