const store = require('../services/store');
const { ok, fail } = require('../utils/response');
const { required } = require('../middleware/validate');

const productsController = {
  list(req, res, next) {
    try {
      const { ownerId, retailerId, category, status } = req.query;
      const filters = {};
      if (ownerId) filters.ownerId = ownerId;
      if (retailerId) filters.retailerId = retailerId;
      if (category) filters.category = category;
      if (status) filters.status = status;
      const products = store.list('products', Object.keys(filters).length ? filters : undefined);
      ok(res, products);
    } catch (e) {
      next(e);
    }
  },

  getByWadn(req, res, next) {
    try {
      const { wadn } = req.params;
      const products = store.list('products', { wadn });
      if (products.length === 0) {
        return fail(res, 'Product not found', 404, 'NOT_FOUND');
      }
      ok(res, products[0]);
    } catch (e) {
      next(e);
    }
  },

  create(req, res, next) {
    try {
      const body = req.body;
      const items = Array.isArray(body) ? body : [body];
      const inserted = [];
      for (const item of items) {
        const record = { ...item };
        if (!record.id) record.id = store.uid ? store.uid() : Date.now().toString(36) + Math.random().toString(16).slice(2, 10);
        if (!record.wadn) record.wadn = 'WADN-IND-2026-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        inserted.push(store.put('products', record));
      }
      ok(res, inserted, 201);
    } catch (e) {
      next(e);
    }
  },

  update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const existing = store.get('products', id);
      if (!existing) {
        return fail(res, 'Product not found', 404, 'NOT_FOUND');
      }
      const updated = store.patch('products', id, updates);
      ok(res, updated);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = productsController;
