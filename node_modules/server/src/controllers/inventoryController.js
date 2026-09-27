const store = require('../services/store');
const { ok } = require('../utils/response');

const inventoryController = {
  list(req, res, next) {
    try {
      const products = store.list('products');
      const inventory = products.filter(p => p.retailerId);
      ok(res, inventory);
    } catch (e) {
      next(e);
    }
  },

  expiring(req, res, next) {
    try {
      const groups = store.inventoryExpiringGroups();
      ok(res, groups);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = inventoryController;
