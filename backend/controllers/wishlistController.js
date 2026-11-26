const db = require('../db/connection');

/**
 * Get all wishlist items for the authenticated user.
 */
async function getWishlist(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT w.product_id, p.name, p.brand, cat.name AS category,
                    p.price, p.image_url
             FROM wishlist w
             JOIN products p ON w.product_id = p.product_id
             JOIN categories cat ON p.category_id = cat.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({ success: true, count: rows.length, wishlist: rows });
    } catch (err) {
        console.error('GET /api/wishlist error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch wishlist' });
    }
}

/**
 * Toggle a product in the wishlist (add if absent, remove if present).
 */
async function toggleWishlist(req, res) {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'productId is required' });
        }

        const [product] = await db.query('SELECT product_id, name FROM products WHERE product_id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const [existing] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        if (existing.length > 0) {
            await db.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
            return res.json({ success: true, action: 'removed', message: `${product[0].name} removed from wishlist` });
        }

        await db.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            [req.user.id, productId]
        );
        res.status(201).json({ success: true, action: 'added', message: `${product[0].name} added to wishlist` });
    } catch (err) {
        console.error('POST /api/wishlist error:', err);
        res.status(500).json({ success: false, error: 'Failed to update wishlist' });
    }
}

/**
 * Remove a specific item from the wishlist.
 */
async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;

        const [result] = await db.query(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Wishlist item not found' });
        }

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
        console.error('DELETE /api/wishlist error:', err);
        res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
    }
}

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
