const { ok, fail } = require('../../utils/response');
const db = require('../../services/db');
const { verifyPin, generateSessionToken, generatePosJwt } = require('../../utils/crypto');
const auditService = require('../../services/auditService');

async function login(req, res, next) {
  try {
    const { terminalCode, pin, profileId, isManager } = req.body;
    
    const { data: terminals } = await db.query('terminals').select('*').eq('terminal_code', terminalCode).limit(1);
    if (!terminals || terminals.length === 0) return fail(res, 'Terminal not found', 404);
    const terminal = terminals[0];

    const hashToVerify = isManager ? terminal.manager_pin_hash : terminal.pin_hash;
    if (!verifyPin(pin, hashToVerify)) return fail(res, 'Invalid PIN', 401);

    const profile = await db.getById('profiles', profileId);
    if (!profile) return fail(res, 'Profile not found', 404);

    const sessionToken = generateSessionToken();
    const sessionRecord = await db.insert('pos_sessions', {
      terminal_id: terminal.id,
      organization_id: terminal.organization_id,
      cashier_profile_id: profile.id,
      cashier_name: profile.full_name,
      is_manager: isManager,
      session_token: sessionToken,
      status: 'ACTIVE'
    });

    const jwt = generatePosJwt({ sessionToken, sessionId: sessionRecord.id });
    
    await db.update('terminals', terminal.id, {
      status: 'ONLINE', active_cashier_id: profile.id, active_cashier_name: profile.full_name, last_heartbeat: new Date().toISOString()
    });

    await auditService.logAudit({
      orgId: terminal.organization_id, entityType: 'TERMINAL', entityId: terminal.id, event: 'POS_LOGIN',
      actorId: profile.id, actorName: profile.full_name
    });

    ok(res, { token: jwt, session: sessionRecord });
  } catch (e) { next(e); }
}

async function logout(req, res, next) {
  try {
    const pos = req.pos;
    await db.update('pos_sessions', pos.sessionId, { status: 'ENDED', ended_at: new Date().toISOString() });
    await db.update('terminals', pos.terminalId, { active_cashier_id: null, active_cashier_name: null });
    
    await auditService.logAudit({
      orgId: pos.orgId, entityType: 'TERMINAL', entityId: pos.terminalId, event: 'POS_LOGOUT',
      actorId: null, actorName: pos.cashierName
    });

    ok(res, { success: true });
  } catch (e) { next(e); }
}

async function getSession(req, res, next) {
  try {
    ok(res, req.pos);
  } catch (e) { next(e); }
}

module.exports = { login, logout, getSession };
