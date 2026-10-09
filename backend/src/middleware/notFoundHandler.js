/**
 * 404 Not Found middleware for unmatched routes.
 * Emits standard DESIGN.md error envelope.
 */
export function notFoundHandler(req, res) {
  const requestId = req.id || 'req_unknown';

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    meta: {
      requestId,
    },
  });
}

export default notFoundHandler;
