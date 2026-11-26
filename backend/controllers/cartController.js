const db = require('../db/connection');

const MAX_QTY = 99;

function clampQuantity(quantity) {
    return Math.max(1, Math.min(MAX_QTY, Math.floor(quantity) || 1));
}

/**
 * Get all cart items and totals for a session.
 */
async function getCart(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT c.product_id, c.quantity,
                    p.name, p.brand, cat.name AS category,
                    p.price, p.image_url
             FROM cart c
             JOIN products p ON c.product_id = p.product_id
             JOIN categories cat ON p.category_id = cat.id
             WHERE c.session_id = ?`,
            [req.params.sessionId]
        );

        const totalAmount = rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalItems = rows.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            cart: rows,
            totalItems,
            totalAmount
        });
    } catch (err) {
        console.error('GET /api/cart error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch cart' });
    }
}

/**
 * Add an item to the cart (or increment quantity if already present).
 */
async function addToCart(req, res) {
    try {
        const { sessionId, productId, quantity = 1 } = req.body;

        if (!sessionId || !productId) {
            return res.status(400).json({ success: false, error: 'sessionId and productId are required' });
        }

        const [product] = await db.query('SELECT product_id, name FROM products WHERE product_id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const qty = clampQuantity(quantity);

        await db.query(
            `INSERT INTO cart (session_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)`,
            [sessionId, productId, qty, MAX_QTY]
        );

        res.status(201).json({
            success: true,
            message: `${product[0].name} added to cart`
        });
    } catch (err) {
        console.error('POST /api/cart error:', err);
        res.status(500).json({ success: false, error: 'Failed to add to cart' });
    }
}

/**
 * Update the quantity of an existing cart item.
 */
async function updateCartQuantity(req, res) {
    try {
        const { sessionId, productId, quantity } = req.body;

        if (!sessionId || !productId || quantity == null) {
            return res.status(400).json({ success: false, error: 'sessionId, productId and quantity are required' });
        }

        const qty = clampQuantity(quantity);

        const [result] = await db.query(
            'UPDATE cart SET quantity = ? WHERE session_id = ? AND product_id = ?',
            [qty, sessionId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }

        res.json({ success: true, message: 'Quantity updated' });
    } catch (err) {
        console.error('PATCH /api/cart error:', err);
        res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
}

/**
 * Remove a specific item from the cart.
 */
async function removeFromCart(req, res) {
    try {
        const { sessionId, productId } = req.params;

        const [result] = await db.query(
            'DELETE FROM cart WHERE session_id = ? AND product_id = ?',
            [sessionId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
        }

        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error('DELETE /api/cart error:', err);
        res.status(500).json({ success: false, error: 'Failed to remove from cart' });
    }
}

/**
 * Clear all items from a session's cart.
 */
async function clearCart(req, res) {
    try {
        await db.query('DELETE FROM cart WHERE session_id = ?', [req.params.sessionId]);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error('DELETE /api/cart/:sessionId error:', err);
        res.status(500).json({ success: false, error: 'Failed to clear cart' });
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};
