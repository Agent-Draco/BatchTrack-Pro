const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const customers = await db.list('customers', { orgId });
    ok(res, customers);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const customer = await db.insert('customers', { ...req.body, organization_id: orgId });
    ok(res, customer);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const customer = await db.getById('customers', req.params.id);
    if (!customer || customer.organization_id !== orgId) return fail(res, 'Not found', 404);
    ok(res, customer);
  } catch (e) { next(e); }
}

module.exports = { list, create, getById };
