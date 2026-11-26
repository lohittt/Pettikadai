/**
 * Handles requests to undefined routes (404).
 */
function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Route not found' });
}

/**
 * Global Express error-handling middleware (500).
 */
function errorHandler(err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
