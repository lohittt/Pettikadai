const db = require('../db/connection');

/**
 * List all product categories.
 */
async function getCategories(req, res) {
    try {
        const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
        res.json({ success: true, categories: rows });
    } catch (err) {
        console.error('GET /api/categories error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
}

module.exports = {
    getCategories
};
