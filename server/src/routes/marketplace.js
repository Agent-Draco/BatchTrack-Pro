const express = require('express');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

router.get('/', marketplaceController.list);
router.post('/offer', marketplaceController.createOffer);
router.post('/:id/claim', marketplaceController.claim);

module.exports = router;
