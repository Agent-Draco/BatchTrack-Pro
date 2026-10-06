const express = require('express');
const router = express.Router();
const customersController = require('../../controllers/enterprise/customersController');

router.get('/', customersController.list);
router.post('/', customersController.create);
router.get('/:id', customersController.getById);

module.exports = router;
