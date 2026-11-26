/**
 * Authentication & Authorization middleware.
 */

/**
 * Rejects unauthenticated requests with 401.
 */
function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ success: false, error: 'Authentication required' });
}

/**
 * Returns middleware that checks req.user.role against allowed roles.
 * Usage: requireRole('admin')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        return next();
    };
}

module.exports = { requireAuth, requireRole };
