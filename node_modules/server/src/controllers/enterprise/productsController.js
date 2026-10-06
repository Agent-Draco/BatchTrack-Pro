const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const products = await db.list('products', { orgId });
    const batches = await db.list('batches', { orgId });

    const enriched = (products || []).map((p) => {
      const prodBatches = (batches || []).filter((b) => b.product_id === p.id);
      const stock = prodBatches.reduce((sum, b) => sum + (Number(b.current_qty) || 0), 0);
      return {
        ...p,
        price: p.base_price,
        stock: `${stock} ${p.unit || 'units'}`,
      };
    });

    ok(res, enriched);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth?.orgId || '11111111-1111-1111-1111-111111111101';
    const product = await db.insert('products', { ...req.body, organization_id: orgId });
    ok(res, product);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const product = await db.update('products', req.params.id, req.body);
    ok(res, product);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const product = await db.getById('products', req.params.id);
    if (!product) return fail(res, 'Not found', 404);
    const batches = await db.list('batches', { filters: { product_id: product.id } });
    const wadns = await db.list('wadns', { filters: { product_id: product.id } });
    ok(res, { ...product, batches, wadns });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, getById };
