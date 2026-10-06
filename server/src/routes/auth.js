const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { ok, fail } = require('../utils/response');
const authEnterprise = require('../middleware/authEnterprise');
const supabase = require('../services/supabaseAdmin');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, orgId, role } = req.body;
    const { data: user, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return fail(res, error.message, 400);
    
    const profile = await db.insert('profiles', {
      id: user.user.id,
      organization_id: orgId,
      full_name: fullName,
      email: email,
      role: role || 'staff',
      is_active: true
    });
    ok(res, profile);
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  // Usually client handles this directly via Supabase, but stubbed if needed
  ok(res, { message: 'Use Supabase client to login directly' });
});

router.get('/session', authEnterprise, async (req, res, next) => {
  try {
    ok(res, req.auth);
  } catch (e) { next(e); }
});

router.get('/profile', authEnterprise, async (req, res, next) => {
  try {
    ok(res, req.auth.profile);
  } catch (e) { next(e); }
});

router.patch('/profile', authEnterprise, async (req, res, next) => {
  try {
    const updated = await db.update('profiles', req.auth.userId, req.body);
    ok(res, updated);
  } catch (e) { next(e); }
});

module.exports = router;
