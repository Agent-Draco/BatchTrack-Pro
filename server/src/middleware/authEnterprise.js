const supabase = require('../services/supabaseAdmin');
const { fail } = require('../utils/response');

async function authEnterprise(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!supabase) return fail(res, 'Database not configured', 500);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return fail(res, 'Invalid token', 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      return fail(res, 'Profile not found or inactive', 403);
    }

    req.auth = {
      userId: user.id,
      orgId: profile.organization_id,
      role: profile.role,
      profile
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authEnterprise;
