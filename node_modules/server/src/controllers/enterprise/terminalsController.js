const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const { hashPin } = require('../../utils/crypto');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawTerminals = await db.list('terminals', { orgId });
    const terminals = (rawTerminals || []).map((t) => ({
      ...t,
      name: t.terminal_name || t.name || t.terminal_code,
      location: t.counter_location || t.location || 'Main Floor',
      active_cashier: t.active_cashier_name || t.active_cashier || 'Pooja V',
    }));
    ok(res, terminals);
  } catch (e) {
    next(e);
  }
}

async function createOrUpdate(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const data = { ...req.body, organization_id: orgId };
    if (data.pin) {
      data.pin_hash = hashPin(data.pin);
      delete data.pin;
    }
    if (data.manager_pin) {
      data.manager_pin_hash = hashPin(data.manager_pin);
      delete data.manager_pin;
    }

    let result;
    if (data.id) result = await db.update('terminals', data.id, data);
    else result = await db.insert('terminals', data);

    ok(res, result);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const terminal = await db.getById('terminals', req.params.id);
    if (!terminal) return fail(res, 'Not found', 404);
    ok(res, {
      ...terminal,
      name: terminal.terminal_name || terminal.name || terminal.terminal_code,
      location: terminal.counter_location || terminal.location || 'Main Floor',
      active_cashier: terminal.active_cashier_name || terminal.active_cashier || 'Pooja V',
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, createOrUpdate, getById };
