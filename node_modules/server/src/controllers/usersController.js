const store = require('../services/store');
const { ok } = require('../utils/response');

const usersController = {
  getProducts(req, res, next) {
    try {
      const { id } = req.params;
      const products = store.list('products', { ownerId: id });
      ok(res, products);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = usersController;
