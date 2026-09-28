const express = require('express');
const usersController = require('../../controllers/common/usersController');

const usersRouter = express.Router();

usersRouter.get('/:id/products', usersController.getProducts);

module.exports = usersRouter;
