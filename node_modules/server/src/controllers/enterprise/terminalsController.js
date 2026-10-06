const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const { hashPin } = require('../../utils/crypto');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const terminals = await db.list('terminals', { orgId });
    ok(res, terminals);
  } catch (e) { next(e); }
}

async function createOrUpdate(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const data = { ...req.body, organization_id: orgId };
    if (data.pin) { data.pin_hash = hashPin(data.pin); delete data.pin; }
    if (data.manager_pin) { data.manager_pin_hash = hashPin(data.manager_pin); delete data.manager_pin; }
    
    let result;
    if (data.id) result = await db.update('terminals', data.id, data);
    else result = await db.insert('terminals', data);
    
    ok(res, result);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const terminal = await db.getById('terminals', req.params.id);
    if (!terminal || terminal.organization_id !== orgId) return fail(res, 'Not found', 404);
    ok(res, terminal);
  } catch (e) { next(e); }
}

module.exports = { list, createOrUpdate, getById };
