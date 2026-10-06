const { ok, fail } = require('../../utils/response');
const returnEngine = require('../../services/returnEngine');

async function initiateReturn(req, res, next) {
  try {
    const pos = req.pos;
    const { originalSaleId, customerPhone, customerName, reason, items } = req.body;
    
    const result = await returnEngine.processReturn({
      orgId: pos.orgId,
      originalSaleId, customerPhone, customerName, reason, items,
      managerId: null, managerName: pos.cashierName, terminalId: pos.terminalId
    });

    ok(res, result);
  } catch (e) { next(e); }
}

module.exports = { initiateReturn };
