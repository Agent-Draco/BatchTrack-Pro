const express = require('express');
const averoController = require('../../controllers/avero/averoController');

const averoRouter = express.Router();

// Executive Dashboard & Attention stream
averoRouter.get('/dashboard', averoController.getDashboard);

// Products & SKUs
averoRouter.get('/products', averoController.getProducts);

// 3-Level Inventory & Movement Ledger
averoRouter.get('/inventory', averoController.getInventory);
averoRouter.get('/inventory/movements', averoController.getInventoryMovements);
averoRouter.post('/inventory/adjust', averoController.adjustStock);

// Sales & Immutable Invoices
averoRouter.get('/sales', averoController.getSales);
averoRouter.get('/sales/:id', averoController.getSaleDetail);
averoRouter.post('/sales/checkout', averoController.checkout);

// Change Credit Ledger
averoRouter.get('/change-credits', averoController.getAllChangeCredits);
averoRouter.get('/change-credits/:phone', averoController.getCustomerCredits);

// Returns & Inspections Workflow
averoRouter.get('/returns', averoController.getReturns);
averoRouter.post('/returns/create', averoController.createReturn);
averoRouter.patch('/returns/items/:id/disposition', averoController.updateItemDisposition);

// Salvage & Distributor Return Intelligence
averoRouter.get('/salvage', averoController.getSalvageIntelligence);

// Terminals & Authorization
averoRouter.get('/terminals', averoController.getTerminals);
averoRouter.post('/terminals/verify', averoController.verifyTerminal);
averoRouter.post('/terminals/save', averoController.saveTerminal);

// Immutable Audit Logs
averoRouter.get('/audit-logs', averoController.getAuditLogs);

module.exports = averoRouter;
