function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || String(status);

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    error: {
      message,
      code,
    },
  });
}

module.exports = errorHandler;
