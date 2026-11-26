const db = require('../db/connection');
const { attachItemsToOrders } = require('../services/orderService');

/**
 * GET /api/admin/users — List all users (safe fields only).
 */
async function getUsers(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, count: rows.length, users: rows });
    } catch (err) {
        console.error('GET /api/admin/users error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
}

/**
 * GET /api/admin/orders — List all orders across all users.
 */
async function getAllOrders(req, res) {
    try {
        const [orders] = await db.query(
            `SELECT o.order_id, o.total_amount, o.shipping_address, o.status,
                    o.created_at, o.updated_at,
                    COALESCE(NULLIF(o.name, ''), u.name, 'Customer') AS user_name,
                    COALESCE(u.email, '') AS user_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );

        const ordersWithItems = await attachItemsToOrders(orders);
        res.json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
    } catch (err) {
        console.error('GET /api/admin/orders error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
}

/**
 * PATCH /api/admin/orders/:orderId/status — Update order status.
 */
async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, orderId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.json({ success: true, message: `Order ${orderId} updated to ${status}` });
    } catch (err) {
        console.error('PATCH /api/admin/orders/:orderId/status error:', err);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
}

module.exports = { getUsers, getAllOrders, updateOrderStatus };
