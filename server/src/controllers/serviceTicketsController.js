const store = require('../services/store');
const { ok, fail } = require('../utils/response');
const { required } = require('../middleware/validate');

const DEMO_CONSUMER_ID = 'demo-consumer-1';
const DEMO_RETAILER_ID = 'demo-retailer-1';
const DEMO_PHONE = '+919000000000';

function uid() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 10);
}

function findUserByPhone(phone) {
  const users = store.list('users');
  return users.find(u => u.phone === phone) || null;
}

function addActivityLog(entry) {
  store.put('activityLogs', {
    id: uid(),
    ts: new Date().toISOString(),
    ...entry,
  });
}

const serviceTicketsController = {
  list(req, res, next) {
    try {
      const { status } = req.query;
      const filters = {};
      if (status) filters.status = status;
      const tickets = store.list('serviceTickets', Object.keys(filters).length ? filters : undefined);
      ok(res, tickets);
    } catch (e) {
      next(e);
    }
  },

  create(req, res, next) {
    try {
      const body = req.body;
      required(body, ['wadn', 'productName', 'issue']);

      const {
        wadn,
        productName,
        customerPhone = DEMO_PHONE,
        retailerId = DEMO_RETAILER_ID,
        issue,
        warrantyActive,
        purchaseRecord,
        invoiceNo,
      } = body;

      let customer = findUserByPhone(customerPhone);
      const customerId = customer ? customer.id : DEMO_CONSUMER_ID;

      const product = store.list('products', { wadn })[0];
      let warranty = warrantyActive;
      if (warranty === undefined && product && product.warrantyEnd) {
        warranty = new Date(product.warrantyEnd) > new Date();
      }

      const history = [
        { ts: new Date().toISOString(), event: 'created' },
      ];

      const ticket = store.put('serviceTickets', {
        id: uid(),
        wadn,
        productName,
        customerId,
        customerPhone,
        retailerId,
        issue,
        status: 'open',
        createdAt: new Date().toISOString(),
        warrantyActive: !!warranty,
        purchaseRecord,
        invoiceNo,
        history,
      });

      if (product) {
        addActivityLog({
          entityId: product.id,
          entityType: 'product',
          event: 'service-requested',
          detail: `Service requested: ${issue}`,
          actorPhone: customerPhone,
        });
      }

      ok(res, ticket, 201);
    } catch (e) {
      next(e);
    }
  },

  update(req, res, next) {
    try {
      const { id } = req.params;
      const body = req.body;
      const { status, resolution } = body;

      const ticket = store.get('serviceTickets', id);
      if (!ticket) {
        return fail(res, 'Service ticket not found', 404, 'NOT_FOUND');
      }

      const updates = {};
      const newHistory = [];

      if (status) {
        updates.status = status;
        if (status === 'accepted') {
          newHistory.push({ ts: new Date().toISOString(), event: 'Service accepted by retailer' });
          addActivityLog({
            entityId: ticket.id,
            entityType: 'warranty-claim',
            event: 'warranty-claim',
            detail: `Warranty claim accepted for ${ticket.productName} (${ticket.wadn})`,
            actorPhone: ticket.customerPhone,
          });
        }
        if (status === 'closed') {
          newHistory.push({ ts: new Date().toISOString(), event: 'Ticket closed' });
        }
        if (status === 'in-progress') {
          newHistory.push({ ts: new Date().toISOString(), event: 'Service in progress' });
        }
      }
      if (resolution) {
        updates.resolution = resolution;
        newHistory.push({ ts: new Date().toISOString(), event: `Resolution: ${resolution}` });
      }

      if (newHistory.length > 0) {
        updates.history = [...(ticket.history || []), ...newHistory];
      }

      const updated = store.patch('serviceTickets', id, updates);
      ok(res, updated);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = serviceTicketsController;
