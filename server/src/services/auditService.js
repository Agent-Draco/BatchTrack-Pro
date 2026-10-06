const db = require('./db');

async function logAudit({ orgId, entityType, entityId, event, detail, actorId, actorName, ipAddress, metadata }) {
  try {
    await db.insert('audit_logs', {
      organization_id: orgId,
      entity_type: entityType,
      entity_id: entityId,
      event,
      detail,
      actor_id: actorId,
      actor_name: actorName,
      ip_address: ipAddress,
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

module.exports = {
  logAudit
};
