const store = require('../services/store');
const { ok, fail } = require('../utils/response');
const { required } = require('../middleware/validate');
const { todayPlusDays, daysFromNow } = require('../utils/date');

const DEMO_CONSUMER_ID = 'demo-consumer-1';
const DEMO_RETAILER_ID = 'demo-retailer-1';

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

const transactionsController = {
  list(req, res, next) {
    try {
      const transactions = store.list('transactions');
      ok(res, transactions);
    } catch (e) {
      next(e);
    }
  },

  create(req, res, next) {
    try {
      const body = req.body;
      required(body, ['customerPhone', 'items', 'totalPaid']);
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return fail(res, 'items must be a non-empty array', 400, 'VALIDATION_ERROR');
      }

      const {
        customerPhone,
        items,
        subtotal = 0,
        discount = 0,
        total = 0,
        totalPaid,
        changeGiven = 0,
        changeCreditAmount = 0,
        retailerId = DEMO_RETAILER_ID,
      } = body;

      let customer = findUserByPhone(customerPhone);
      if (!customer) {
        customer = {
          id: DEMO_CONSUMER_ID,
          name: 'Demo Customer',
          phone: customerPhone,
          type: 'consumer',
        };
      }

      const consumerProductsAdded = [];
      const inventoryDecremented = [];

      for (const item of items) {
        const inventoryProducts = store.list('products', { wadn: item.wadn, retailerId }).filter(p => p.quantity >= item.qty);
        let sourceProduct = inventoryProducts[0];
        if (!sourceProduct) {
          const allProducts = store.list('products', { wadn: item.wadn }).filter(p => p.retailerId);
          sourceProduct = allProducts[0];
        }
        if (sourceProduct) {
          const newQty = Math.max(0, sourceProduct.quantity - item.qty);
          store.patch('products', sourceProduct.id, { quantity: newQty });
          addActivityLog({
            entityId: sourceProduct.id,
            entityType: 'product',
            event: 'sold-wadn-' + item.wadn,
            detail: `Sold ${item.qty}x ${item.name} from inventory`,
            actorPhone: retailerId,
          });
          inventoryDecremented.push({ wadn: item.wadn, qty: item.qty });

          const consumerProduct = {
            id: uid(),
            wadn: item.wadn,
            name: item.name,
            category: sourceProduct.category || 'consumables',
            brand: sourceProduct.brand || '',
            batch: sourceProduct.batch || '',
            quantity: item.qty,
            purchaseDate: new Date().toISOString(),
            expiryDate: sourceProduct.expiryDate || todayPlusDays(30),
            warrantyEnd: sourceProduct.warrantyEnd,
            purchasePrice: item.price,
            sellingPrice: item.price,
            retailerId,
            ownerId: customer.id,
            status: 'in-stock',
            sku: sourceProduct.sku,
          };
          store.put('products', consumerProduct);
          consumerProductsAdded.push(consumerProduct.id);
          addActivityLog({
            entityId: consumerProduct.id,
            entityType: 'product',
            event: 'ownership-transfer',
            detail: `Ownership transferred to customer ${customerPhone} for ${item.name}`,
            actorPhone: customerPhone,
          });
        }
      }

      let changeCreditId = null;
      if (changeCreditAmount > 0) {
        const txnId = uid();
        const credit = store.put('changeCredits', {
          id: uid(),
          customerPhone,
          amount: changeCreditAmount,
          status: 'active',
          transactionId: txnId,
          createdAt: new Date().toISOString(),
        });
        changeCreditId = credit.id;
        addActivityLog({
          entityId: credit.id,
          entityType: 'change-credit',
          event: 'change-credit-issued',
          detail: `Change credit ₹${changeCreditAmount} issued to ${customerPhone}`,
          actorPhone: customerPhone,
        });
      }

      const transaction = store.put('transactions', {
        id: uid(),
        retailerId,
        customerPhone,
        items,
        subtotal,
        discount,
        total,
        totalPaid,
        changeGiven,
        changeCreditAmount,
        date: new Date().toISOString(),
      });

      addActivityLog({
        entityId: transaction.id,
        entityType: 'transaction',
        event: 'transaction-completed',
        detail: `Transaction completed for ₹${total} with ${items.length} items`,
        actorPhone: customerPhone,
      });

      ok(res, {
        transaction,
        sideEffects: {
          consumerProductsAdded,
          inventoryDecremented,
          changeCredit: changeCreditId,
        },
      }, 201);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = transactionsController;
