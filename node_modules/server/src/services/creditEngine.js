const db = require('./db');
const { nextNumber } = require('./sequenceService');

async function issueCredit({ orgId, customerPhone, customerName, customerId, amount, originalSaleId, type='ISSUED_ON_CHANGE', notes }) {
  if (!customerId && customerPhone) {
    const existing = await db.query('customers').select('*').eq('organization_id', orgId).eq('phone', customerPhone).single();
    if (existing.data) customerId = existing.data.id;
  }
  
  const creditNumber = await nextNumber(orgId, 'credit');
  const credit = await db.insert('change_credits', {
    organization_id: orgId,
    credit_number: creditNumber,
    customer_id: customerId,
    customer_phone: customerPhone,
    customer_name: customerName,
    original_sale_id: originalSaleId,
    amount,
    balance: amount,
    type,
    status: 'ACTIVE',
    notes
  });
  
  if (customerId) {
    const c = await db.getById('customers', customerId);
    await db.update('customers', customerId, { available_change_credit: Number(c.available_change_credit || 0) + amount });
  }
  return credit;
}

async function redeemCredit({ orgId, customerPhone, amount, saleId }) {
  const { data: credits } = await db.query('change_credits')
    .select('*')
    .eq('organization_id', orgId)
    .eq('customer_phone', customerPhone)
    .eq('status', 'ACTIVE')
    .gt('balance', 0)
    .order('created_at', { ascending: true });
    
  let remainingToRedeem = amount;
  let actuallyRedeemed = 0;
  
  for (const credit of (credits || [])) {
    if (remainingToRedeem <= 0) break;
    
    const redeemFromThis = Math.min(Number(credit.balance), remainingToRedeem);
    const newBalance = Number(credit.balance) - redeemFromThis;
    
    await db.update('change_credits', credit.id, {
      balance: newBalance,
      status: newBalance <= 0 ? 'REDEEMED' : 'ACTIVE'
    });
    
    remainingToRedeem -= redeemFromThis;
    actuallyRedeemed += redeemFromThis;
  }
  
  if (actuallyRedeemed > 0) {
    const { data: customerData } = await db.query('customers').select('*').eq('organization_id', orgId).eq('phone', customerPhone).single();
    if (customerData) {
      await db.update('customers', customerData.id, { available_change_credit: Math.max(0, Number(customerData.available_change_credit || 0) - actuallyRedeemed) });
    }
  }
  
  return actuallyRedeemed;
}

async function getCustomerCredits(orgId, customerPhone) {
  const { data: customerData } = await db.query('customers').select('*').eq('organization_id', orgId).eq('phone', customerPhone).single();
  const balance = customerData ? Number(customerData.available_change_credit || 0) : 0;
  const { data: history } = await db.query('change_credits').select('*').eq('organization_id', orgId).eq('customer_phone', customerPhone).order('created_at', { ascending: false });
  return { availableBalance: balance, history: history || [] };
}

async function reverseCredit(creditId, amount, reason) {
  // Logic for reverting credit on returns if necessary
}

module.exports = { issueCredit, redeemCredit, getCustomerCredits, reverseCredit };
