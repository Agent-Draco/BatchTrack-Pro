const store = require('../../services/store');
const { ok, fail } = require('../../utils/response');
const { required } = require('../../middleware/validate');

const DEMO_PHONE = '+919000000000';

function uid() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 10);
}

const marketplaceController = {
  list(req, res, next) {
    try {
      const { status } = req.query;
      const filters = {};
      if (status) filters.status = status;
      const listings = store.list('marketplaceListings', Object.keys(filters).length ? filters : undefined);
      ok(res, listings);
    } catch (e) {
      next(e);
    }
  },

  createOffer(req, res, next) {
    try {
      const body = req.body;
      required(body, ['wadn', 'productName', 'category', 'price', 'expiry', 'offeredByPhone', 'offeredByName']);
      const {
        wadn,
        productName,
        category,
        price,
        expiry,
        distanceKm = 1.0,
        offeredByPhone,
        offeredByName,
      } = body;

      const listing = store.put('marketplaceListings', {
        id: uid(),
        wadn,
        productName,
        category,
        price,
        expiry,
        distanceKm,
        offeredByPhone,
        offeredByName,
        status: 'available',
        createdAt: new Date().toISOString(),
      });
      ok(res, listing, 201);
    } catch (e) {
      next(e);
    }
  },

  claim(req, res, next) {
    try {
      const { id } = req.params;
      const { claimedByPhone = DEMO_PHONE } = req.body || {};

      const listing = store.get('marketplaceListings', id);
      if (!listing) {
        return fail(res, 'Marketplace listing not found', 404, 'NOT_FOUND');
      }

      const updated = store.patch('marketplaceListings', id, {
        status: 'claimed',
        claimedByPhone,
        claimedAt: new Date().toISOString(),
      });
      ok(res, updated);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = marketplaceController;
