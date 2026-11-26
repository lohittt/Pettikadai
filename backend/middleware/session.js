const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('../db/connection');

/**
 * Create session middleware with MySQL-backed store.
 */
function createSessionMiddleware() {
    const sessionStore = new MySQLStore({
        clearExpired: true,
        checkExpirationInterval: 900000, // 15 min
        expiration: 86400000,            // 24 hours
        createDatabaseTable: false       // We define it in schema.sql
    }, db);

    return session({
        key: 'pettikadai_sid',
        secret: process.env.SESSION_SECRET || 'pettikadai-dev-secret-change-in-prod',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400000 // 24 hours
        }
    });
}

module.exports = { createSessionMiddleware };
