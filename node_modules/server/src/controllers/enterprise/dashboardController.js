const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');

async function getDashboard(req, res, next) {
  try {
    const orgId = req.auth.orgId;
    
    // Simplistic aggregations
    const { data: sales } = await db.query('sales').select('total').eq('organization_id', orgId);
    const totalSales = (sales || []).reduce((sum, s) => sum + Number(s.total), 0);
    
    const { data: terminals } = await db.query('terminals').select('*').eq('organization_id', orgId).eq('status', 'ONLINE');
    
    // Mocks for now
    const totalInventoryValue = 0;
    const recoverableSalvageValue = 0;
    const attentionItems = { nearExpiry: 0, distributorReturns: 0, pendingReturns: 0 };
    const recentAuditLogs = await db.list('audit_logs', { orgId, limit: 5, orderBy: { column: 'created_at', ascending: false } });

    ok(res, {
      kpis: {
        totalSalesToday: totalSales,
        totalInventoryValue,
        recoverableSalvageValue
      },
      attentionItems,
      recentAuditLogs,
      activeTerminals: terminals ? terminals.length : 0
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getDashboard };
