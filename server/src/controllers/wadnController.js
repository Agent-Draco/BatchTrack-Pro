const store = require('../services/store');
const { ok, fail } = require('../utils/response');
const { daysFromNow } = require('../utils/date');

const wadnController = {
  getByIdentity(req, res, next) {
    try {
      const { wadn } = req.params;
      const allProducts = store.list('products', { wadn });

      if (allProducts.length === 0) {
        return fail(res, 'No product found with this WADN', 404, 'NOT_FOUND');
      }

      let product = allProducts.find(p => p.ownerId && p.ownerId !== p.retailerId) || allProducts[0];

      const users = store.list('users');
      const retailers = store.list('retailers');

      const owner = users.find(u => u.id === product.ownerId) || null;
      const retailer = retailers.find(r => r.id === product.retailerId) || users.find(u => u.id === product.retailerId) || null;

      const serviceTickets = store.list('serviceTickets', { wadn });
      const serviceHistory = [];
      serviceTickets.forEach(t => {
        serviceHistory.push({
          ticketId: t.id,
          status: t.status,
          issue: t.issue,
          createdAt: t.createdAt,
          history: t.history || [],
        });
      });

      const activityLogs = store.list('activityLogs').filter(l => l.entityType === 'product' && l.entityId === product.id);
      activityLogs.forEach(l => {
        serviceHistory.push({
          type: 'activity',
          event: l.event,
          detail: l.detail,
          ts: l.ts,
        });
      });

      const expiryDays = product.expiryDate ? daysFromNow(product.expiryDate) : null;
      const warrantyDays = product.warrantyEnd ? daysFromNow(product.warrantyEnd) : null;
      const warrantyActive = warrantyDays !== null ? warrantyDays > 0 : false;

      let statusText = 'Owned';
      let pill = 'success';
      if (expiryDays !== null) {
        if (expiryDays < 0) {
          statusText = 'Expired';
          pill = 'danger';
        } else if (expiryDays <= 3) {
          statusText = 'Expiring soon';
          pill = 'warning';
        } else if (expiryDays <= 14) {
          statusText = 'Use soon';
          pill = 'warning';
        }
      }
      if (warrantyDays !== null && warrantyDays <= 14 && warrantyDays > 0) {
        statusText = 'Warranty ending soon';
        pill = 'warning';
      }
      if (warrantyDays !== null && warrantyDays <= 0) {
        statusText = 'Warranty expired';
        pill = 'muted';
      }

      const lifecycleSteps = [];
      lifecycleSteps.push({ label: 'Purchased', status: 'done' });
      lifecycleSteps.push({ label: 'Added to inventory', status: 'done' });
      lifecycleSteps.push({ label: 'Checked into system', status: 'done' });

      if (product.warrantyEnd) {
        if (warrantyActive) {
          lifecycleSteps.push({
            label: warrantyDays <= 30 ? `Warranty active (${warrantyDays} days left)` : 'Warranty active',
            status: 'active',
          });
        } else {
          lifecycleSteps.push({ label: 'Warranty expired', status: 'done' });
        }
      }

      if (expiryDays !== null && expiryDays <= 14) {
        if (expiryDays < 0) {
          lifecycleSteps.push({ label: 'Product expired - action required', status: 'warning' });
        } else {
          lifecycleSteps.push({ label: `Expiring in ${expiryDays} days - action required`, status: 'warning' });
        }
      } else {
        lifecycleSteps.push({ label: 'Status good', status: 'done' });
      }

      const result = {
        product,
        owner,
        retailer,
        batch: product.batch,
        warranty: {
          warrantyEnd: product.warrantyEnd || null,
          warrantyActive,
          warrantyDaysLeft: warrantyDays,
        },
        serviceHistory,
        currentStatus: {
          status: statusText,
          pill,
          expiryDaysLeft: expiryDays,
        },
        lifecycleSteps,
      };

      ok(res, result);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = wadnController;
