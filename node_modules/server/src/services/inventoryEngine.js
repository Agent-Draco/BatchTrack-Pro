const db = require('./db');
const { nextNumber } = require('./sequenceService');

async function recordMovement({ orgId, productId, batchId, wadnId, qty, fromState, toState, movementType, referenceType, referenceId, reason, performedBy, notes }) {
  const movementNumber = await nextNumber(orgId, 'movement');
  return await db.insert('inventory_movements', {
    organization_id: orgId,
    movement_number: movementNumber,
    product_id: productId,
    batch_id: batchId,
    wadn_id: wadnId,
    qty,
    from_state: fromState,
    to_state: toState,
    movement_type: movementType,
    reference_type: referenceType,
    reference_id: referenceId,
    reason,
    performed_by: performedBy,
    notes
  });
}

async function selectBatchFEFO(orgId, productId, requiredQty) {
  const { data, error } = await db.query('batches')
    .select('*')
    .eq('organization_id', orgId)
    .eq('product_id', productId)
    .gte('current_qty', requiredQty)
    .in('status', ['ACTIVE'])
    .order('expiry_date', { ascending: true, nullsFirst: false })
    .limit(1);
  
  if (error || !data || data.length === 0) return null;
  return data[0];
}

async function decrementBatchQty(batchId, qty) {
  const batch = await db.getById('batches', batchId);
  if (!batch || batch.current_qty < qty) throw new Error('Insufficient batch quantity');
  return await db.update('batches', batchId, { current_qty: batch.current_qty - qty });
}

async function incrementBatchQty(batchId, qty) {
  const batch = await db.getById('batches', batchId);
  if (!batch) throw new Error('Batch not found');
  return await db.update('batches', batchId, { current_qty: batch.current_qty + qty });
}

async function updateWadnStatus(wadnId, newStatus, historyEvent) {
  const updated = await db.update('wadns', wadnId, { status: newStatus });
  await db.insert('wadn_history', {
    wadn_id: wadnId,
    event: historyEvent,
    detail: `Status updated to ${newStatus}`,
    actor: 'SYSTEM',
    metadata: {}
  });
  return updated;
}

module.exports = {
  recordMovement,
  selectBatchFEFO,
  decrementBatchQty,
  incrementBatchQty,
  updateWadnStatus
};
