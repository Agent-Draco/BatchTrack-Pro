const { ok, fail } = require('../../utils/response');
const checkoutEngine = require('../../services/checkoutEngine');

async function checkout(req, res, next) {
  try {
    const pos = req.pos;
    const { customerPhone, customerName, items, payments, changeCreditToIssue } = req.body;
    
    const result = await checkoutEngine.processCheckout({
      orgId: pos.orgId,
      terminalId: pos.terminalId,
      cashierName: pos.cashierName,
      cashierProfileId: null,
      customerPhone, customerName, items, payments, changeCreditToIssue
    });

    ok(res, result);
  } catch (e) { next(e); }
}

module.exports = { checkout };
