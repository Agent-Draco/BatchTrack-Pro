const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function getTree(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const products = await db.list('products', { orgId });
    const batches = await db.list('batches', { orgId });

    const items = (batches || []).map((b) => {
      const prod = (products || []).find((p) => p.id === b.product_id);
      return {
        ...b,
        product_name: prod?.name || 'Retail Product',
        sku: prod?.sku || '',
        qty: b.current_qty,
        cost: b.cost_price,
      };
    });

    ok(res, items);
  } catch (e) {
    next(e);
  }
}

async function getMovements(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const movements = await db.list('inventory_movements', { orgId, orderBy: { column: 'created_at', ascending: false } });
    ok(res, movements);
  } catch (e) {
    next(e);
  }
}

async function adjustStock(req, res, next) {
  try {
    const { batchId, qty, reason } = req.body;
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    if (batchId) {
      await db.update('batches', batchId, { current_qty: Number(qty) });
    }
    ok(res, { success: true, newQty: qty });
  } catch (e) {
    next(e);
  }
}

module.exports = { getTree, getMovements, adjustStock };
