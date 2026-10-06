const { verifyPosJwt } = require('../utils/crypto');
const supabase = require('../services/supabaseAdmin');
const { fail } = require('../utils/response');

async function authPos(req, res, next) {
  const token = req.headers['x-pos-session'];
  if (!token) {
    return fail(res, 'Missing X-POS-Session header', 401);
  }

  try {
    const payload = verifyPosJwt(token);
    
    if (!supabase) return fail(res, 'Database not configured', 500);

    const { data: session, error } = await supabase
      .from('pos_sessions')
      .select('*')
      .eq('session_token', payload.sessionToken)
      .eq('status', 'ACTIVE')
      .single();

    if (error || !session) {
      return fail(res, 'Invalid or expired POS session', 401);
    }

    req.pos = {
      sessionId: session.id,
      terminalId: session.terminal_id,
      orgId: session.organization_id,
      isManager: session.is_manager,
      cashierName: session.cashier_name
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return fail(res, 'Invalid or expired POS token', 401);
    }
    next(err);
  }
}

module.exports = authPos;
