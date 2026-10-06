const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const creditEngine = require('../../services/creditEngine');

async function listAll(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawCredits = await db.list('change_credits', { orgId, orderBy: { column: 'created_at', ascending: false } });
    const credits = (rawCredits || []).map((c) => ({
      ...c,
      reference_id: c.credit_number || c.original_sale_id || c.id,
    }));
    ok(res, credits);
  } catch (e) {
    next(e);
  }
}

async function getCustomerCredits(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const data = await creditEngine.getCustomerCredits(orgId, req.params.phone);
    ok(res, data);
  } catch (e) {
    next(e);
  }
}

module.exports = { listAll, getCustomerCredits };
