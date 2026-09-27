const express = require('express');
const wadnController = require('../controllers/wadnController');

const router = express.Router();

router.get('/:wadn', wadnController.getByIdentity);

module.exports = router;
