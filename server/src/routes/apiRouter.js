const express = require('express');
const { ok } = require('../utils/response');

// Trackly Routes
const pantryRouter = require('./trackly/pantry');
const marketplaceRouter = require('./trackly/marketplace');

// Common Platform Routes
const usersRouter = require('./common/users');
const wadnRouter = require('./common/wadn');

// Avero Dedicated OS & POS Routes
const averoRouter = require('./avero/averoRouter');

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  ok(res, { ok: true, name: 'BatchTrack API (Trackly + Avero)', ts: Date.now() });
});

// Avero Enterprise & POS Subsystem
apiRouter.use('/avero', averoRouter);

// Trackly Consumer Subsystem
apiRouter.use('/pantry', pantryRouter);
apiRouter.use('/marketplace', marketplaceRouter);

// Common Identity & Shared Registry Subsystem
apiRouter.use('/users', usersRouter);
apiRouter.use('/wadn', wadnRouter);

// Direct compatibility aliases mapped cleanly to Avero engine
apiRouter.get('/products', (req, res, next) => averoRouter.handle(req, res, next));
apiRouter.get('/inventory', (req, res, next) => averoRouter.handle(req, res, next));
apiRouter.get('/transactions', (req, res, next) => averoRouter.handle(req, res, next));
apiRouter.post('/transactions', (req, res, next) => averoRouter.handle(req, res, next));

module.exports = apiRouter;
