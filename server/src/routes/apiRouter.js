const express = require('express');
const router = express.Router();

const authEnterprise = require('../middleware/authEnterprise');
const authPos = require('../middleware/authPos');

const authRoutes = require('./auth');

// Enterprise Routes
const enterpriseDashboard = require('./enterprise/dashboard');
const enterpriseProducts = require('./enterprise/products');
const enterpriseInventory = require('./enterprise/inventory');
const enterpriseSales = require('./enterprise/sales');
const enterpriseReturns = require('./enterprise/returns');
const enterpriseCustomers = require('./enterprise/customers');
const enterpriseChangeCredits = require('./enterprise/changeCredits');
const enterpriseSalvage = require('./enterprise/salvage');
const enterpriseTerminals = require('./enterprise/terminals');
const enterpriseAudit = require('./enterprise/audit');

// POS Routes
const posAuth = require('./pos/posAuth');
const posCheckout = require('./pos/posCheckout');
const posLookup = require('./pos/posLookup');
const posReturns = require('./pos/posReturns');

// Trackly Routes (Consumer App — preserved as-is)
const pantryRouter = require('./trackly/pantry');
const marketplaceRouter = require('./trackly/marketplace');
const usersRouter = require('./common/users');
const wadnRouter = require('./common/wadn');

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
router.use('/auth', authRoutes);

// Enterprise API (Requires authEnterprise middleware)
router.use('/avero/dashboard', authEnterprise, enterpriseDashboard);
router.use('/avero/products', authEnterprise, enterpriseProducts);
router.use('/avero/inventory', authEnterprise, enterpriseInventory);
router.use('/avero/sales', authEnterprise, enterpriseSales);
router.use('/avero/returns', authEnterprise, enterpriseReturns);
router.use('/avero/customers', authEnterprise, enterpriseCustomers);
router.use('/avero/change-credits', authEnterprise, enterpriseChangeCredits);
router.use('/avero/salvage', authEnterprise, enterpriseSalvage);
router.use('/avero/terminals', authEnterprise, enterpriseTerminals);
router.use('/avero/audit-logs', authEnterprise, enterpriseAudit);

// POS API
router.use('/pos/auth', posAuth);
router.use('/pos/checkout', authPos, posCheckout);
router.use('/pos/lookup', authPos, posLookup);
router.use('/pos/returns', authPos, posReturns);

// Trackly Consumer API (preserved)
router.use('/pantry', pantryRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/users', usersRouter);
router.use('/wadn', wadnRouter);

module.exports = router;
