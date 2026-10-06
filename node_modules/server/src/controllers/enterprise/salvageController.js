const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function getIntelligence(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    ok(res, { nearExpiry: [], deadlines: [], tickets: [] });
  } catch (e) { next(e); }
}

async function createTicket(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const ticket = await db.insert('salvage_tickets', { ...req.body, organization_id: orgId });
    ok(res, ticket);
  } catch (e) { next(e); }
}

async function updateTicket(req, res, next) {
  try {
    const ticket = await db.update('salvage_tickets', req.params.id, req.body);
    ok(res, ticket);
  } catch (e) { next(e); }
}

module.exports = { getIntelligence, createTicket, updateTicket };
