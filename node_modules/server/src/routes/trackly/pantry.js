const express = require('express');
const pantryController = require('../../controllers/trackly/pantryController');

const pantryRouter = express.Router();

pantryRouter.post('/scan', pantryController.scan);

module.exports = pantryRouter;
