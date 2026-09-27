const express = require('express');
const serviceTicketsController = require('../controllers/serviceTicketsController');

const router = express.Router();

router.get('/', serviceTicketsController.list);
router.post('/', serviceTicketsController.create);
router.patch('/:id', serviceTicketsController.update);

module.exports = router;
