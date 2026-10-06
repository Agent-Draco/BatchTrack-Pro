const db = require('./db');

async function nextNumber(orgId, sequenceField) {
  // Try to use RPC if defined, else fallback to select-then-update
  try {
    const nextVal = await db.rpc('increment_sequence', { org_id: orgId, seq_field: sequenceField });
    return nextVal;
  } catch (err) {
    // Fallback simple mechanism
    const q = db.query('invoice_sequences').select('*').eq('organization_id', orgId);
    const { data, error } = await q.single();
    if (error || !data) throw new Error('Sequence not initialized for org');
    
    const counterField = `${sequenceField}_counter`;
    const prefixField = `${sequenceField}_prefix`;
    
    const current = data[counterField];
    const prefix = data[prefixField];
    const nextVal = current + 1;
    
    await db.update('invoice_sequences', orgId, { [counterField]: nextVal }); // Assuming org_id is PK
    return `${prefix}${String(nextVal).padStart(6, '0')}`;
  }
}

module.exports = {
  nextNumber
};
