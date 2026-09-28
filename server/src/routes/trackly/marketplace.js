const express = require('express');
const marketplaceController = require('../../controllers/trackly/marketplaceController');

const marketplaceRouter = express.Router();

marketplaceRouter.get('/', marketplaceController.list);
marketplaceRouter.post('/offer', marketplaceController.createOffer);
marketplaceRouter.post('/:id/claim', marketplaceController.claim);

module.exports = marketplaceRouter;
