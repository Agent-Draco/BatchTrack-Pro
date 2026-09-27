function ok(res, data, status = 200) {
  res.status(status).json(data);
}

function fail(res, message, status = 400, code) {
  res.status(status).json({
    error: {
      message,
      code: code || String(status),
    },
  });
}

module.exports = { ok, fail };
