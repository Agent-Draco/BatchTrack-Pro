const averoStore = require('../../services/avero/averoStore');
const { ok, fail } = require('../../utils/response');

const averoController = {
  // Dashboard & Attention Intelligence
  getDashboard(req, res, next) {
    try {
      const data = averoStore.getDashboardOverview();
      ok(res, data);
    } catch (e) {
      next(e);
    }
  },

  // Products & SKUs
  getProducts(req, res, next) {
    try {
      const products = averoStore.getProductsWithStock();
      ok(res, products);
    } catch (e) {
      next(e);
    }
  },

  // Inventory Tree (Product -> Batch -> WADN) & Movements
  getInventory(req, res, next) {
    try {
      const tree = averoStore.getInventoryTree();
      ok(res, tree);
    } catch (e) {
      next(e);
    }
  },

  getInventoryMovements(req, res, next) {
    try {
      const movements = averoStore.inventoryMovements.slice().reverse();
      ok(res, movements);
    } catch (e) {
      next(e);
    }
  },

  adjustStock(req, res, next) {
    try {
      const { batchId, newQty, reason, managerName } = req.body;
      if (!batchId || newQty === undefined) {
        return fail(res, 'batchId and newQty are required for stock adjustment', 400);
      }
      const result = averoStore.adjustBatchStock({ batchId, newQty, reason, managerName });
      ok(res, result);
    } catch (e) {
      next(e);
    }
  },

  // Immutable Sales & POS Checkout
  getSales(req, res, next) {
    try {
      const sales = averoStore.getSalesList(req.query);
      ok(res, sales);
    } catch (e) {
      next(e);
    }
  },

  getSaleDetail(req, res, next) {
    try {
      const { id } = req.params;
      const sale = averoStore.getSaleDetail(id);
      if (!sale) return fail(res, 'Sale not found', 404);
      ok(res, sale);
    } catch (e) {
      next(e);
    }
  },

  checkout(req, res, next) {
    try {
      const result = averoStore.processPosCheckout(req.body);
      ok(res, result, 201);
    } catch (e) {
      next(e);
    }
  },

  // Change Credits Ledger
  getCustomerCredits(req, res, next) {
    try {
      const { phone } = req.params;
      const data = averoStore.getCustomerCredits(phone);
      ok(res, data);
    } catch (e) {
      next(e);
    }
  },

  getAllChangeCredits(req, res, next) {
    try {
      const list = averoStore.changeCredits.slice().reverse();
      ok(res, list);
    } catch (e) {
      next(e);
    }
  },

  // Multi-stage Returns & Refunds Workflow
  getReturns(req, res, next) {
    try {
      const list = averoStore.returns.map(r => {
        const items = averoStore.returnItems.filter(ri => ri.returnId === r.id);
        const refunds = averoStore.refunds.filter(ref => ref.returnId === r.id);
        return { ...r, items, refunds };
      }).reverse();
      ok(res, list);
    } catch (e) {
      next(e);
    }
  },

  createReturn(req, res, next) {
    try {
      const result = averoStore.createReturnRequest(req.body);
      ok(res, result, 201);
    } catch (e) {
      next(e);
    }
  },

  updateItemDisposition(req, res, next) {
    try {
      const { id } = req.params;
      const { disposition, managerName } = req.body;
      if (!disposition) return fail(res, 'disposition is required', 400);
      const result = averoStore.updateItemDisposition(id, disposition, managerName);
      ok(res, result);
    } catch (e) {
      next(e);
    }
  },

  // Salvage Intelligence & Distributor Returns
  getSalvageIntelligence(req, res, next) {
    try {
      const overview = averoStore.getDashboardOverview();
      const allBatches = averoStore.batches.map(b => {
        const prod = averoStore.products.find(p => p.id === b.productId);
        return {
          ...b,
          productName: prod?.name,
          sku: prod?.sku,
          brand: prod?.brand,
          category: prod?.category,
        };
      });

      ok(res, {
        attentionItems: overview.attentionItems,
        batches: allBatches,
        recoverableValue: overview.kpis.recoverableSalvageValueINR,
      });
    } catch (e) {
      next(e);
    }
  },

  // POS Terminals & Devices
  getTerminals(req, res, next) {
    try {
      ok(res, averoStore.terminals);
    } catch (e) {
      next(e);
    }
  },

  verifyTerminal(req, res, next) {
    try {
      const { terminalCode, pin } = req.body;
      const result = averoStore.verifyTerminalPin(terminalCode, pin);
      if (!result.authorized) {
        return fail(res, result.error, 401);
      }
      ok(res, result);
    } catch (e) {
      next(e);
    }
  },

  saveTerminal(req, res, next) {
    try {
      const term = averoStore.createOrUpdateTerminal(req.body);
      ok(res, term);
    } catch (e) {
      next(e);
    }
  },

  // Immutable Audit Trail
  getAuditLogs(req, res, next) {
    try {
      const logs = averoStore.auditLogs.slice().reverse();
      ok(res, logs);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = averoController;
