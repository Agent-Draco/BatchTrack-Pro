const store = require('../services/store');
const { ok } = require('../utils/response');

const pantryController = {
  scan(req, res, next) {
    try {
      const detections = store.pantryScanMock();
      ok(res, { detections }, 200);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = pantryController;
