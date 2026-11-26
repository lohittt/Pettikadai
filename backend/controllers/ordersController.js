const db = require('../db/connection');
const crypto = require('crypto');
const { attachItemsToOrders } = require('../services/orderService');
const { validateAddress, stripHtml } = require('../services/validationService');

/**
 * Place a new order using DB cart items or client-sent items as fallback.
 */
async function placeOrder(req, res) {
    const conn = await db.getConnection();
    try {
        const { address, items: clientItems } = req.body;
        const userId = req.user.id;

        const addrValidation = validateAddress(address);
        if (!addrValidation.valid) {
            return res.status(400).json({ success: false, error: addrValidation.error });
        }
        const cleanAddress = addrValidation.value;

        let cartItems;
        const [dbCart] = await conn.query(
            `SELECT c.product_id, c.quantity, p.price, p.name
             FROM cart c
             JOIN products p ON c.product_id = p.product_id
             WHERE c.user_id = ?`,
            [userId]
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
        const userName = stripHtml(req.user.name || '').slice(0, 100) || 'Customer';

        await conn.beginTransaction();

        await conn.query(
            'INSERT INTO orders (order_id, user_id, name, total_amount, shipping_address) VALUES (?, ?, ?, ?, ?)',
            [orderId, userId, userName, totalAmount, cleanAddress]
        );

        const itemValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
        await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [itemValues]
        );

        await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: { orderId, name: userName, totalAmount, itemCount: cartItems.length, status: 'pending' }
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
 * Get all orders for the authenticated user.
 */
async function getOrders(req, res) {
    try {
        const [orders] = await db.query(
            `SELECT order_id, total_amount, shipping_address, status, created_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        const ordersWithItems = await attachItemsToOrders(orders);
        res.json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
    } catch (err) {
        console.error('GET /api/orders error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
}

/**
 * Get single order details by order_id (scoped to user).
 */
async function getOrderById(req, res) {
    try {
        const [orders] = await db.query(
            'SELECT order_id, user_id, total_amount, shipping_address, status, created_at FROM orders WHERE order_id = ?',
            [req.params.orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Users can only view their own orders; admins can view any
        if (req.user.role !== 'admin' && orders[0].user_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const [withItems] = await attachItemsToOrders([orders[0]]);
        const { user_id, ...orderData } = withItems;
        res.json({ success: true, order: orderData });
    } catch (err) {
        console.error('GET /api/orders/detail error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
}

module.exports = { placeOrder, getOrders, getOrderById };
