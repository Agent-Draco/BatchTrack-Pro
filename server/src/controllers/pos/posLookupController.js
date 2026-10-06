const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const creditEngine = require('../../services/creditEngine');

async function lookupBarcode(req, res, next) {
  try {
    const orgId = req.pos.orgId;
    const { data } = await db.query('products').select('*').eq('organization_id', orgId).eq('barcode', req.params.barcode).single();
    if (!data) return fail(res, 'Not found', 404);
    ok(res, data);
  } catch (e) { next(e); }
}

async function lookupSku(req, res, next) {
  try {
    const orgId = req.pos.orgId;
    const { data } = await db.query('products').select('*').eq('organization_id', orgId).eq('sku', req.params.sku).single();
    if (!data) return fail(res, 'Not found', 404);
    ok(res, data);
  } catch (e) { next(e); }
}

async function lookupWadn(req, res, next) {
  try {
    const orgId = req.pos.orgId;
    const { data } = await db.query('wadns').select('*').eq('organization_id', orgId).eq('wadn_code', req.params.wadn).single();
    if (!data) return fail(res, 'Not found', 404);
    ok(res, data);
  } catch (e) { next(e); }
}

async function lookupCustomer(req, res, next) {
  try {
    const orgId = req.pos.orgId;
    const phone = req.params.phone;
    const { data: customer } = await db.query('customers').select('*').eq('organization_id', orgId).eq('phone', phone).single();
    const credits = await creditEngine.getCustomerCredits(orgId, phone);
    ok(res, { customer, credits });
  } catch (e) { next(e); }
}

module.exports = { lookupBarcode, lookupSku, lookupWadn, lookupCustomer };
