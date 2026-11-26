const corsMiddleware = require('./cors');
const { notFoundHandler, errorHandler } = require('./errorHandler');
const { requireAuth, requireRole } = require('./auth');
const { createSessionMiddleware } = require('./session');
const { configurePassport } = require('./passport');

module.exports = {
    corsMiddleware,
    notFoundHandler,
    errorHandler,
    requireAuth,
    requireRole,
    createSessionMiddleware,
    configurePassport
};
