const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawCustomers = await db.list('customers', { orgId });
    const customers = (rawCustomers || []).map((c) => ({
      ...c,
      credit_balance: c.available_change_credit !== undefined ? c.available_change_credit : (c.credit_balance || 0),
    }));
    ok(res, customers);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const customer = await db.insert('customers', { ...req.body, organization_id: orgId });
    ok(res, customer);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const customer = await db.getById('customers', req.params.id);
    if (!customer) return fail(res, 'Not found', 404);
    ok(res, {
      ...customer,
      credit_balance: customer.available_change_credit !== undefined ? customer.available_change_credit : (customer.credit_balance || 0),
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, getById };
