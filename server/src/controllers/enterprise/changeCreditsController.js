const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const creditEngine = require('../../services/creditEngine');

async function listAll(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const credits = await db.list('change_credits', { orgId, orderBy: { column: 'created_at', ascending: false } });
    ok(res, credits);
  } catch (e) { next(e); }
}

async function getCustomerCredits(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const data = await creditEngine.getCustomerCredits(orgId, req.params.phone);
    ok(res, data);
  } catch (e) { next(e); }
}

module.exports = { listAll, getCustomerCredits };
