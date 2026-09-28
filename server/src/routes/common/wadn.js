const express = require('express');
const wadnController = require('../../controllers/common/wadnController');

const wadnRouter = express.Router();

wadnRouter.get('/:wadn', wadnController.getByIdentity);

module.exports = wadnRouter;
