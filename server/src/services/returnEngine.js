const db = require('./db');
const { nextNumber } = require('./sequenceService');
const inventoryEngine = require('./inventoryEngine');
const auditService = require('./auditService');

async function processReturn({ orgId, originalSaleId, customerPhone, customerName, reason, items, managerId, managerName, terminalId }) {
  const sale = await db.getById('sales', originalSaleId);
  if (!sale) throw new Error('Original sale not found');

  const returnNumber = await nextNumber(orgId, 'return');
  let totalRefund = 0;
  
  const returnRecord = await db.insert('returns', {
    organization_id: orgId,
    return_number: returnNumber,
    original_sale_id: originalSaleId,
    invoice_number: sale.invoice_number,
    terminal_id: terminalId,
    customer_id: sale.customer_id,
    customer_phone: customerPhone || sale.customer_phone,
    customer_name: customerName || sale.customer_name,
    return_reason: reason,
    total_refund_amount: 0,
    status: 'APPROVED',
    authorized_by: managerId,
    authorizer_name: managerName
  });

  const returnItems = [];
  const movements = [];

  for (const item of items) {
    const saleItem = await db.getById('sale_items', item.saleItemId);
    if (!saleItem || saleItem.sale_id !== originalSaleId) throw new Error(`Invalid sale item: ${item.saleItemId}`);
    if (saleItem.qty - saleItem.returned_qty < item.qty) throw new Error(`Cannot return more than sold for item: ${saleItem.id}`);

    const refundAmount = saleItem.unit_price * item.qty; // Simplification, need to handle discounts in real scenario
    totalRefund += refundAmount;

    let disposition = 'INSPECTION_PENDING';
    if (item.condition === 'UNOPENED') disposition = 'RESTOCK';
    if (item.condition === 'DAMAGED') disposition = 'DAMAGED';

    await db.update('sale_items', saleItem.id, { returned_qty: saleItem.returned_qty + item.qty });

    if (saleItem.wadn_id) {
      await inventoryEngine.updateWadnStatus(saleItem.wadn_id, 'RETURNED', 'RETURN');
    }

    const rItem = await db.insert('return_items', {
      return_id: returnRecord.id,
      sale_item_id: saleItem.id,
      product_id: saleItem.product_id,
      batch_id: saleItem.batch_id,
      wadn_id: saleItem.wadn_id,
      product_name: saleItem.product_name,
      sku: saleItem.sku,
      qty: item.qty,
      return_unit_price: saleItem.unit_price,
      refund_amount: refundAmount,
      reason: item.reason,
      condition: item.condition,
      disposition: disposition,
      status: 'PROCESSED'
    });
    returnItems.push(rItem);

    if (disposition === 'RESTOCK') {
      await inventoryEngine.incrementBatchQty(saleItem.batch_id, item.qty);
      const mov = await inventoryEngine.recordMovement({
        orgId,
        productId: saleItem.product_id,
        batchId: saleItem.batch_id,
        wadnId: saleItem.wadn_id,
        qty: item.qty,
        fromState: 'SOLD',
        toState: 'IN_STOCK',
        movementType: 'RETURN_RESTOCK',
        referenceType: 'RETURN',
        referenceId: returnRecord.id,
        reason: 'Customer return',
        performedBy: managerName
      });
      movements.push(mov);
    }
  }

  await db.update('sales', originalSaleId, { status: 'PARTIAL_RETURN' });
  const finalReturn = await db.update('returns', returnRecord.id, { total_refund_amount: totalRefund, status: 'REFUND_PENDING' });

  const refundNumber = await nextNumber(orgId, 'refund');
  const refundRecord = await db.insert('refunds', {
    organization_id: orgId,
    refund_number: refundNumber,
    return_id: returnRecord.id,
    sale_id: originalSaleId,
    customer_id: sale.customer_id,
    customer_phone: sale.customer_phone,
    method: 'MANUAL',
    amount: totalRefund,
    status: 'COMPLETED'
  });

  await db.update('returns', returnRecord.id, { status: 'REFUNDED' });

  await auditService.logAudit({
    orgId, entityType: 'RETURN', entityId: returnRecord.id, event: 'CREATED',
    detail: `Return ${returnNumber} processed`, actorId: managerId, actorName: managerName
  });

  return { returnRecord: finalReturn, returnItems, refundRecord, movements };
}

async function updateDisposition(returnItemId, newDisposition, managerName) {
  return await db.update('return_items', returnItemId, { disposition: newDisposition });
}

module.exports = { processReturn, updateDisposition };
