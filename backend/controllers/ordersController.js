const db = require('../db/connection');
const crypto = require('crypto');

async function fetchOrderItems(orderId) {
    const [items] = await db.query(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [orderId]
    );
    return items;
}

/**
 * Place a new order using DB cart items or client-sent items as fallback.
 */
async function placeOrder(req, res) {
    const conn = await db.getConnection();
    try {
        const { sessionId, address, items: clientItems } = req.body;

        if (!sessionId || !address) {
            return res.status(400).json({ success: false, error: 'sessionId and address are required' });
        }

        if (address.trim().length < 5) {
            return res.status(400).json({ success: false, error: 'Address must be at least 5 characters' });
        }

        let cartItems;
        const [dbCart] = await conn.query(
            `SELECT c.product_id, c.quantity, p.price, p.name
             FROM cart c
             JOIN products p ON c.product_id = p.product_id
             WHERE c.session_id = ?`,
            [sessionId]
        );

        if (dbCart.length > 0) {
            cartItems = dbCart;
        } else if (Array.isArray(clientItems) && clientItems.length > 0) {
            const productIds = clientItems.map(i => i.productId);
            const placeholders = productIds.map(() => '?').join(',');
            const [productRows] = await conn.query(
                `SELECT product_id, price, name FROM products WHERE product_id IN (${placeholders})`,
                productIds
            );
            const priceMap = Object.fromEntries(productRows.map(p => [p.product_id, p]));

            cartItems = clientItems
                .filter(i => priceMap[i.productId])
                .map(i => ({
                    product_id: i.productId,
                    quantity: Math.max(1, Math.min(99, Math.floor(i.quantity) || 1)),
                    price: priceMap[i.productId].price,
                    name: priceMap[i.productId].name
                }));
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, error: 'Cart is empty' });
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderId = `PK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        await conn.beginTransaction();

        await conn.query(
            'INSERT INTO orders (order_id, session_id, total_amount, shipping_address) VALUES (?, ?, ?, ?)',
            [orderId, sessionId, totalAmount, address.trim()]
        );

        const itemValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
        await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [itemValues]
        );

        await conn.query('DELETE FROM cart WHERE session_id = ?', [sessionId]);

        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                orderId,
                totalAmount,
                itemCount: cartItems.length,
                status: 'pending'
            }
        });
    } catch (err) {
        await conn.rollback();
        console.error('POST /api/orders error:', err);
        res.status(500).json({ success: false, error: 'Failed to place order' });
    } finally {
        conn.release();
    }
}

/**
 * Get all orders for a session.
 */
async function getOrdersBySession(req, res) {
    try {
        const [orders] = await db.query(
            `SELECT order_id, total_amount, shipping_address, status, created_at
             FROM orders
             WHERE session_id = ?
             ORDER BY created_at DESC`,
            [req.params.sessionId]
        );

        for (const order of orders) {
            order.items = await fetchOrderItems(order.order_id);
        }

        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        console.error('GET /api/orders error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
}

/**
 * Get single order details by order_id.
 */
async function getOrderById(req, res) {
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [req.params.orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const items = await fetchOrderItems(req.params.orderId);
        res.json({ success: true, order: { ...orders[0], items } });
    } catch (err) {
        console.error('GET /api/orders/detail error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
}

module.exports = {
    placeOrder,
    getOrdersBySession,
    getOrderById
};
