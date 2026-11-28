const db = require('../db/connection');
const { attachItemsToOrders } = require('../services/orderService');

/**
 * GET /api/admin/dashboard — Aggregated monitoring stats for orders, products, and users.
 */
async function getDashboard(req, res) {
    try {
        const [
            [orderAggRows],
            [productAggRows],
            [categoryBreakdown],
            [userAggRows],
            [recentOrders],
            [recentUsers]
        ] = await Promise.all([
            db.query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(status = 'pending') AS pending,
                    SUM(status = 'confirmed') AS confirmed,
                    SUM(status = 'shipped') AS shipped,
                    SUM(status = 'delivered') AS delivered,
                    SUM(status = 'cancelled') AS cancelled,
                    COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue
                FROM orders
            `),
            db.query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(is_featured = TRUE) AS featured
                FROM products
            `),
            db.query(`
                SELECT c.name AS category, COUNT(p.id) AS count
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.id
                GROUP BY c.id, c.name
                ORDER BY c.name ASC
            `),
            db.query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(role = 'user') AS customers,
                    SUM(role = 'admin') AS admins
                FROM users
            `),
            db.query(`
                SELECT o.order_id, o.total_amount, o.status, o.created_at,
                       COALESCE(NULLIF(o.name, ''), u.name, 'Customer') AS user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 5
            `),
            db.query(`
                SELECT id, name, email, role, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 5
            `)
        ]);

        const ord = orderAggRows[0] || {};
        const prod = productAggRows[0] || {};
        const usr = userAggRows[0] || {};

        res.json({
            success: true,
            dashboard: {
                orders: {
                    total: Number(ord.total) || 0,
                    pending: Number(ord.pending) || 0,
                    confirmed: Number(ord.confirmed) || 0,
                    shipped: Number(ord.shipped) || 0,
                    delivered: Number(ord.delivered) || 0,
                    cancelled: Number(ord.cancelled) || 0,
                    totalRevenue: Number(ord.totalRevenue) || 0
                },
                products: {
                    total: Number(prod.total) || 0,
                    featured: Number(prod.featured) || 0,
                    byCategory: categoryBreakdown.map(r => ({
                        category: r.category,
                        count: Number(r.count) || 0
                    }))
                },
                users: {
                    total: Number(usr.total) || 0,
                    customers: Number(usr.customers) || 0,
                    admins: Number(usr.admins) || 0
                },
                recentOrders,
                recentUsers
            }
        });
    } catch (err) {
        console.error('GET /api/admin/dashboard error:', err);
        res.status(500).json({ success: false, error: 'Failed to load dashboard' });
    }
}

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

module.exports = { getDashboard, getUsers, getAllOrders, updateOrderStatus };
