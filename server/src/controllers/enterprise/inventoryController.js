const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const inventoryEngine = require('../../services/inventoryEngine');

async function getTree(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const products = await db.list('products', { orgId });
    ok(res, { products });
  } catch (e) { next(e); }
}

async function getMovements(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const movements = await db.list('inventory_movements', { orgId, orderBy: { column: 'created_at', ascending: false } });
    ok(res, movements);
  } catch (e) { next(e); }
}

async function adjustStock(req, res, next) {
  try {
    const { batchId, qty, reason } = req.body;
    const orgId = req.auth.orgId;
    // Real implementation would calculate difference and log movement
    ok(res, { success: true });
  } catch (e) { next(e); }
}

module.exports = { getTree, getMovements, adjustStock };
