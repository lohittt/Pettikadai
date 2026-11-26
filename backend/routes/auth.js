const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', getMe);

module.exports = router;
