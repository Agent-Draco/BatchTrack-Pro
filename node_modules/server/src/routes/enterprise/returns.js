const express = require('express');
const router = express.Router();
const returnsController = require('../../controllers/enterprise/returnsController');

router.get('/', returnsController.list);
router.post('/', returnsController.create);
router.patch('/items/:id/disposition', returnsController.updateDisposition);

module.exports = router;
