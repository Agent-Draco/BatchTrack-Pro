const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function list(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const products = await db.list('products', { orgId });
    ok(res, products);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    const product = await db.insert('products', { ...req.body, organization_id: orgId });
    ok(res, product);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const product = await db.update('products', req.params.id, req.body);
    ok(res, product);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const product = await db.getById('products', req.params.id);
    if (!product || product.organization_id !== req.auth.orgId) return fail(res, 'Not found', 404);
    const batches = await db.list('batches', { filters: { product_id: product.id } });
    const wadns = await db.list('wadns', { filters: { product_id: product.id } });
    ok(res, { ...product, batches, wadns });
  } catch (e) { next(e); }
}

module.exports = { list, create, update, getById };
