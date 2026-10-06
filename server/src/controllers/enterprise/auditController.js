const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const logs = await db.list('audit_logs', { orgId, limit: 100, orderBy: { column: 'created_at', ascending: false } });
    ok(res, logs);
  } catch (e) { next(e); }
}

module.exports = { list };
