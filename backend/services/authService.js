const bcrypt = require('bcrypt');
const db = require('../db/connection');

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 */
async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare plain text with a hash.
 */
async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

/**
 * Find a user by email (returns full row including password_hash).
 */
async function findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
}

/**
 * Find a user by id (returns full row including password_hash).
 */
async function findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
}

/**
 * Create a new user. Returns the created user (without password_hash).
 */
async function createUser({ name, email, password }) {
    const hash = await hashPassword(password);
    const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, hash]
    );
    return { id: result.insertId, name, email, role: 'user' };
}

/**
 * Strip sensitive fields before sending to client.
 */
function sanitizeUser(user) {
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
}

module.exports = {
    hashPassword,
    verifyPassword,
    findByEmail,
    findById,
    createUser,
    sanitizeUser
};
