const passport = require('passport');
const { createUser, findByEmail, sanitizeUser } = require('../services/authService');
const { validateName, validateEmail, validatePassword } = require('../services/validationService');

/**
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const nameResult = validateName(req.body.name);
        if (!nameResult.valid) return res.status(400).json({ success: false, error: nameResult.error });

        const emailResult = validateEmail(req.body.email);
        if (!emailResult.valid) return res.status(400).json({ success: false, error: emailResult.error });

        const passResult = validatePassword(req.body.password);
        if (!passResult.valid) return res.status(400).json({ success: false, error: passResult.error });

        const existing = await findByEmail(emailResult.value);
        if (existing) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }

        const user = await createUser({
            name: nameResult.value,
            email: emailResult.value,
            password: passResult.value
        });

        // Auto-login after registration
        req.login(user, (err) => {
            if (err) {
                console.error('Auto-login after register failed:', err);
                return res.status(201).json({ success: true, user });
            }
            return res.status(201).json({ success: true, user });
        });
    } catch (err) {
        console.error('POST /api/auth/register error:', err);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
}

/**
 * POST /api/auth/login
 */
function login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('POST /api/auth/login error:', err);
            return res.status(500).json({ success: false, error: 'Login failed' });
        }
        if (!user) {
            return res.status(401).json({ success: false, error: info?.message || 'Invalid credentials' });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error('Session login error:', loginErr);
                return res.status(500).json({ success: false, error: 'Login failed' });
            }
            return res.json({ success: true, user: sanitizeUser(user) });
        });
    })(req, res, next);
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                console.error('Session destroy error:', sessionErr);
            }
            res.clearCookie('pettikadai_sid');
            return res.json({ success: true, message: 'Logged out' });
        });
    });
}

/**
 * GET /api/auth/me
 */
function getMe(req, res) {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    return res.json({ success: true, user: sanitizeUser(req.user) });
}

module.exports = { register, login, logout, getMe };
