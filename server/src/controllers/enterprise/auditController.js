const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawLogs = await db.list('audit_logs', { orgId, limit: 100, orderBy: { column: 'created_at', ascending: false } });
    const logs = (rawLogs || []).map((l) => ({
      ...l,
      user_email: l.actor_name || l.actor_id || 'manager@aztecretail.in',
      action: l.event || l.detail || 'SYSTEM_RECORD',
    }));
    ok(res, logs);
  } catch (e) {
    next(e);
  }
}

module.exports = { list };
