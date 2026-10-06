const express = require('express');
const router = express.Router();
const salesController = require('../../controllers/enterprise/salesController');

router.get('/', salesController.list);
router.get('/:id', salesController.getDetail);

module.exports = router;
