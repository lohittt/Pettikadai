const db = require('../db/connection');

/**
 * Fetch order items for a list of order IDs in a single query (avoids N+1).
 */
async function attachItemsToOrders(orders) {
    if (!orders || orders.length === 0) return orders;

    const orderIds = orders.map(o => o.order_id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await db.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price,
                COALESCE(p.name, oi.product_id) AS name, p.image_url
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id IN (${placeholders})`,
        orderIds
    );

    const itemsByOrder = new Map();
    for (const item of items) {
        if (!itemsByOrder.has(item.order_id)) {
            itemsByOrder.set(item.order_id, []);
        }
        itemsByOrder.get(item.order_id).push(item);
    }

    return orders.map(order => ({
        ...order,
        items: itemsByOrder.get(order.order_id) || []
    }));
}

module.exports = { attachItemsToOrders };
