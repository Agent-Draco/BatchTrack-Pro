const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/enterprise/auditController');

router.get('/', auditController.list);

module.exports = router;
