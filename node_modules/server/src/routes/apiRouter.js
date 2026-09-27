const express = require('express');
const store = require('../services/store');
const { ok } = require('../utils/response');

const productsRouter = require('./products');
const inventoryRouter = require('./inventory');
const usersRouter = require('./users');
const transactionsRouter = require('./transactions');
const serviceTicketsRouter = require('./serviceTickets');
const changeCreditsRouter = require('./changeCredits');
const analyticsRouter = require('./analytics');
const pantryRouter = require('./pantry');
const wadnRouter = require('./wadn');
const marketplaceRouter = require('./marketplace');

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  ok(res, { ok: true, ts: Date.now() });
});

apiRouter.use('/products', productsRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/service-tickets', serviceTicketsRouter);
apiRouter.use('/change-credits', changeCreditsRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/pantry', pantryRouter);
apiRouter.use('/wadn', wadnRouter);
apiRouter.use('/marketplace', marketplaceRouter);

module.exports = apiRouter;
