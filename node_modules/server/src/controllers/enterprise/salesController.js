const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const sales = await db.list('sales', { orgId, orderBy: { column: 'created_at', ascending: false } });
    ok(res, sales);
  } catch (e) { next(e); }
}

async function getDetail(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const sale = await db.getById('sales', req.params.id);
    if (!sale || sale.organization_id !== orgId) return fail(res, 'Not found', 404);
    const items = await db.list('sale_items', { filters: { sale_id: sale.id } });
    const payments = await db.list('payments', { filters: { sale_id: sale.id } });
    ok(res, { ...sale, items, payments });
  } catch (e) { next(e); }
}

module.exports = { list, getDetail };
