const corsMiddleware = require('./cors');
const { notFoundHandler, errorHandler } = require('./errorHandler');

module.exports = {
    corsMiddleware,
    notFoundHandler,
    errorHandler
};
