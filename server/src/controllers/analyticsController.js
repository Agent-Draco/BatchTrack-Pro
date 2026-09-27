const store = require('../services/store');
const { ok } = require('../utils/response');

const analyticsController = {
  get(req, res, next) {
    try {
      const data = store.getAnalytics();
      ok(res, data);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = analyticsController;
