const db = require('../db/connection');

/**
 * List all products with optional category, search, and sort filters.
 */
async function getProducts(req, res) {
    try {
        const { category, search, sort } = req.query;

        let sql = `
            SELECT p.product_id, p.name, p.brand, c.name AS category,
                   p.price, p.image_url, p.description
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (category && category !== 'All') {
            sql += ' AND c.name = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND (p.name LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        switch (sort) {
            case 'low-high':
                sql += ' ORDER BY p.price ASC';
                break;
            case 'high-low':
                sql += ' ORDER BY p.price DESC';
                break;
            case 'name':
                sql += ' ORDER BY p.name ASC';
                break;
            default:
                sql += ' ORDER BY p.id ASC';
        }

        const [rows] = await db.query(sql, params);
        res.json({ success: true, count: rows.length, products: rows });
    } catch (err) {
        console.error('GET /api/products error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
}

/**
 * Get single product details by product_id.
 */
async function getProductById(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT p.product_id, p.name, p.brand, c.name AS category,
                    p.price, p.image_url, p.description
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.product_id = ?`,
            [req.params.productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product: rows[0] });
    } catch (err) {
        console.error('GET /api/products/:id error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch product' });
    }
}

module.exports = {
    getProducts,
    getProductById
};
