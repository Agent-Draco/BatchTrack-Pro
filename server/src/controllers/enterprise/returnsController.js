const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const returnEngine = require('../../services/returnEngine');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const returns = await db.list('returns', { orgId, orderBy: { column: 'created_at', ascending: false } });
    ok(res, returns);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const { originalSaleId, customerPhone, customerName, reason, items, terminalId } = req.body;
    const result = await returnEngine.processReturn({
      orgId, originalSaleId, customerPhone, customerName, reason, items,
      managerId: req.auth.userId, managerName: req.auth.profile.full_name, terminalId
    });
    ok(res, result);
  } catch (e) { next(e); }
}

async function updateDisposition(req, res, next) {
  try {
    const result = await returnEngine.updateDisposition(req.params.id, req.body.disposition, req.auth.profile.full_name);
    ok(res, result);
  } catch (e) { next(e); }
}

module.exports = { list, create, updateDisposition };
