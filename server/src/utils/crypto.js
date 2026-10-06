// Note: npm install bcryptjs jsonwebtoken is required
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const POS_JWT_SECRET = process.env.POS_JWT_SECRET || 'avero-pos-secret';

function hashPin(pin) {
  return bcrypt.hashSync(pin, 10);
}

function verifyPin(pin, hash) {
  return bcrypt.compareSync(pin, hash);
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generatePosJwt(payload, expiresIn = '12h') {
  return jwt.sign(payload, POS_JWT_SECRET, { expiresIn });
}

function verifyPosJwt(token) {
  return jwt.verify(token, POS_JWT_SECRET);
}

module.exports = {
  hashPin,
  verifyPin,
  generateSessionToken,
  generatePosJwt,
  verifyPosJwt
};
