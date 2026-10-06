const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/enterprise/productsController');

router.get('/', productsController.list);
router.post('/', productsController.create);
router.get('/:id', productsController.getById);
router.patch('/:id', productsController.update);

module.exports = router;
