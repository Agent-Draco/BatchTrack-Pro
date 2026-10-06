const db = require('./db');
const { nextNumber } = require('./sequenceService');
const inventoryEngine = require('./inventoryEngine');
const auditService = require('./auditService');

async function processCheckout({ orgId, terminalId, cashierName, cashierProfileId, customerPhone, customerName, items, payments, changeCreditToIssue }) {
  if (!items || items.length === 0) throw new Error('Items array is empty');
  if (!payments || payments.length === 0) throw new Error('Payments array is empty');

  // Find or create customer
  let customerId = null;
  if (customerPhone) {
    const existing = await db.query('customers').select('*').eq('organization_id', orgId).eq('phone', customerPhone).single();
    if (existing.data) {
      customerId = existing.data.id;
    } else {
      const c = await db.insert('customers', { organization_id: orgId, phone: customerPhone, name: customerName });
      customerId = c.id;
    }
  }

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let grandTotal = 0;
  let processedItems = [];

  const invoiceNumber = await nextNumber(orgId, 'sale');
  
  // Need to create sale first to get ID for items/movements
  const saleRecord = await db.insert('sales', {
    organization_id: orgId,
    invoice_number: invoiceNumber,
    terminal_id: terminalId,
    cashier_profile_id: cashierProfileId,
    cashier_name: cashierName,
    customer_id: customerId,
    customer_name: customerName,
    customer_phone: customerPhone,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    total_paid: 0,
    change_given: 0,
    change_credit_issued: 0,
    change_credit_redeemed: 0,
    status: 'COMPLETED'
  });

  for (const item of items) {
    const product = await db.getById('products', item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    
    let batch = item.batchId ? await db.getById('batches', item.batchId) : await inventoryEngine.selectBatchFEFO(orgId, product.id, item.qty);
    if (!batch) throw new Error(`No batch available for product: ${product.name}`);

    const unitPrice = product.base_price;
    const discount = item.discount || 0;
    const taxAmount = (unitPrice - discount) * (product.tax_rate / 100) * item.qty;
    const total = ((unitPrice - discount) * item.qty) + taxAmount;
    
    subtotal += unitPrice * item.qty;
    totalDiscount += discount * item.qty;
    totalTax += taxAmount;
    grandTotal += total;

    await inventoryEngine.decrementBatchQty(batch.id, item.qty);
    
    if (product.is_serialized && item.wadnId) {
      await inventoryEngine.updateWadnStatus(item.wadnId, 'SOLD', 'SALE');
    }

    const saleItem = await db.insert('sale_items', {
      sale_id: saleRecord.id,
      product_id: product.id,
      batch_id: batch.id,
      wadn_id: item.wadnId,
      sku: product.sku,
      product_name: product.name,
      brand: product.brand,
      category: product.category,
      unit_price: unitPrice,
      qty: item.qty,
      discount: discount,
      tax_amount: taxAmount,
      total: total,
      returned_qty: 0,
      status: 'SOLD'
    });

    processedItems.push(saleItem);

    await inventoryEngine.recordMovement({
      orgId,
      productId: product.id,
      batchId: batch.id,
      wadnId: item.wadnId,
      qty: item.qty,
      fromState: 'IN_STOCK',
      toState: 'SOLD',
      movementType: 'SALE',
      referenceType: 'SALE',
      referenceId: saleRecord.id,
      reason: 'Sale checkout',
      performedBy: cashierName
    });
  }

  let totalPaid = 0;
  let changeCreditRedeemed = 0;
  const processedPayments = [];

  for (const p of payments) {
    if (p.method === 'CHANGE_CREDIT') {
      // Need creditEngine but simple inline logic here to avoid circular dep
      changeCreditRedeemed += p.amount;
    }
    totalPaid += p.amount;
    const payRec = await db.insert('payments', {
      organization_id: orgId,
      sale_id: saleRecord.id,
      method: p.method,
      amount: p.amount,
      status: 'COMPLETED'
    });
    processedPayments.push(payRec);
  }
  
  let changeGiven = totalPaid - grandTotal;
  if (changeGiven < 0) changeGiven = 0;
  let changeCreditIssued = 0;

  if (changeCreditToIssue > 0) {
    changeCreditIssued = changeCreditToIssue;
    changeGiven -= changeCreditToIssue;
    await db.insert('change_credits', {
      organization_id: orgId,
      credit_number: await nextNumber(orgId, 'credit'),
      customer_id: customerId,
      customer_phone: customerPhone,
      customer_name: customerName,
      original_sale_id: saleRecord.id,
      amount: changeCreditIssued,
      balance: changeCreditIssued,
      type: 'ISSUED_ON_CHANGE',
      status: 'ACTIVE'
    });
    // Update customer available credit
    if (customerId) {
       const c = await db.getById('customers', customerId);
       await db.update('customers', customerId, { available_change_credit: Number(c.available_change_credit || 0) + changeCreditIssued });
    }
  }

  const finalSale = await db.update('sales', saleRecord.id, {
    subtotal, discount: totalDiscount, tax: totalTax, total: grandTotal,
    total_paid: totalPaid, change_given: changeGiven, change_credit_issued: changeCreditIssued, change_credit_redeemed: changeCreditRedeemed
  });

  await auditService.logAudit({
    orgId, entityType: 'SALE', entityId: saleRecord.id, event: 'CREATED',
    detail: `Sale ${invoiceNumber} completed`, actorId: cashierProfileId, actorName: cashierName
  });

  return { sale: finalSale, items: processedItems, payments: processedPayments, changeGiven, changeCreditIssued };
}

module.exports = {
  processCheckout
};
