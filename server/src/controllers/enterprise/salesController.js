const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const rawSales = await db.list('sales', { orgId, orderBy: { column: 'created_at', ascending: false } });
    const sales = (rawSales || []).map((s) => ({
      ...s,
      total_amount: s.total !== undefined ? s.total : (s.total_amount || 0),
    }));
    ok(res, sales);
  } catch (e) {
    next(e);
  }
}

async function getDetail(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const sale = await db.getById('sales', req.params.id);
    if (!sale) return fail(res, 'Not found', 404);
    const items = await db.list('sale_items', { filters: { sale_id: sale.id } });
    const payments = await db.list('payments', { filters: { sale_id: sale.id } });
    ok(res, { ...sale, items, payments });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getDetail };
