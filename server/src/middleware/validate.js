function required(body, fields) {
  const missing = [];
  for (const f of fields) {
    if (body === undefined || body === null || body[f] === undefined || body[f] === null || body[f] === '') {
      missing.push(f);
    }
  }
  if (missing.length > 0) {
    const err = new Error('Missing required fields: ' + missing.join(', '));
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  return true;
}

module.exports = { required };
