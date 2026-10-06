const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function getIntelligence(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const tickets = await db.list('salvage_tickets', { orgId, orderBy: { column: 'created_at', ascending: false } });
    const formatted = (tickets || []).map((t, idx) => ({
      ...t,
      ticket_number: t.ticket_number || `SLV-2026-0${idx + 1}`,
      item_count: t.qty || 1,
      estimated_value: t.recoverable_value || 0,
      status: t.status || 'OPEN',
    }));
    ok(res, formatted);
  } catch (e) {
    next(e);
  }
}

async function createTicket(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const ticket = await db.insert('salvage_tickets', { ...req.body, organization_id: orgId });
    ok(res, ticket);
  } catch (e) {
    next(e);
  }
}

async function updateTicket(req, res, next) {
  try {
    const ticket = await db.update('salvage_tickets', req.params.id, req.body);
    ok(res, ticket);
  } catch (e) {
    next(e);
  }
}

module.exports = { getIntelligence, createTicket, updateTicket };
