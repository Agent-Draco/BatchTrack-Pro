const express = require('express');
const router = express.Router();
const terminalsController = require('../../controllers/enterprise/terminalsController');

router.get('/', terminalsController.list);
router.post('/', terminalsController.createOrUpdate);
router.get('/:id', terminalsController.getById);

module.exports = router;
