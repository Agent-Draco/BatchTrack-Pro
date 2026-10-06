const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const returnEngine = require('../../services/returnEngine');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawReturns = await db.list('returns', { orgId, orderBy: { column: 'created_at', ascending: false } });
    const returns = (rawReturns || []).map((r) => ({
      ...r,
      refund_amount: r.total_refund_amount !== undefined ? r.total_refund_amount : (r.refund_amount || 0),
    }));
    ok(res, returns);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const { originalSaleId, customerPhone, customerName, reason, items, terminalId } = req.body;
    const result = await returnEngine.processReturn({
      orgId,
      originalSaleId,
      customerPhone,
      customerName,
      reason,
      items,
      managerId: req.auth?.userId || 'usr_mgr_01',
      managerName: req.auth?.profile?.full_name || 'Ramesh K (Manager)',
      terminalId,
    });
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

async function updateDisposition(req, res, next) {
  try {
    const result = await returnEngine.updateDisposition(
      req.params.id,
      req.body.disposition,
      req.auth?.profile?.full_name || 'Manager'
    );
    ok(res, result);
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, updateDisposition };
