const cors = require('cors');

const allowedOrigin = process.env.FRONTEND_URL;

/**
 * Configures CORS to allow requests from the configured frontend URL,
 * localhost/127.0.0.1 on any port, and file:// ('null' origin).
 * credentials: true enables cookie-based session auth.
 */
const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            origin === 'null' ||
            !allowedOrigin ||
            origin === allowedOrigin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
});

module.exports = corsMiddleware;
