const express = require('express');
const productsController = require('../controllers/productsController');

const router = express.Router();

router.get('/', productsController.list);
router.get('/:wadn', productsController.getByWadn);
router.post('/', productsController.create);
router.patch('/:id', productsController.update);

module.exports = router;
