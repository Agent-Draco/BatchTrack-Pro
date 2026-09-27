const store = require('../services/store');
const { ok } = require('../utils/response');
const { required } = require('../middleware/validate');

function uid() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 10);
}

const changeCreditsController = {
  getByPhone(req, res, next) {
    try {
      const { phone } = req.params;
      const decodedPhone = decodeURIComponent(phone);
      const credits = store.list('changeCredits', { customerPhone: decodedPhone });
      ok(res, credits);
    } catch (e) {
      next(e);
    }
  },

  create(req, res, next) {
    try {
      const body = req.body;
      required(body, ['customerPhone', 'amount']);
      const { customerPhone, amount, transactionId } = body;
      const credit = store.put('changeCredits', {
        id: uid(),
        customerPhone,
        amount,
        status: 'active',
        createdAt: new Date().toISOString(),
        transactionId,
      });
      ok(res, credit, 201);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = changeCreditsController;
