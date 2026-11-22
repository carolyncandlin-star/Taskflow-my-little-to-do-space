function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong on the server." : err.name === "CastError" ? `Invalid value for ${err.path}.` : err.message
  });
}

module.exports = { notFound, errorHandler };
