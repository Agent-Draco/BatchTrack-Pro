const express = require('express');
const router = express.Router();
const posAuthController = require('../../controllers/pos/posAuthController');
const authPos = require('../../middleware/authPos');

router.post('/login', posAuthController.login);
router.post('/logout', authPos, posAuthController.logout);
router.get('/session', authPos, posAuthController.getSession);

module.exports = router;
