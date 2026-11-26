import { useState, useEffect, useCallback } from 'react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { formatINR } from '../../utils/format';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function OrderApproval({ notify }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        const res = await PettikadaiAPI.getAdminOrders();
        if (res?.success && Array.isArray(res.orders)) {
            setOrders(res.orders);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        const res = await PettikadaiAPI.updateOrderStatus(orderId, newStatus);
        if (res?.success) {
            setOrders((prev) =>
                prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
            );
            if (notify) notify(`Order ${orderId} marked as ${newStatus} ✓`);
        } else {
            alert(res?.error || 'Failed to update status');
        }
    };

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">ORDER MANAGEMENT</p>
                    <h2>Customer Orders ({orders.length})</h2>
                </div>
                <button type="button" className="checkout-action" onClick={loadOrders} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="empty-state">
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <h3>No customer orders yet</h3>
                    <p>Orders placed by customers will appear here for approval.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article className="order-card" key={order.order_id}>
                            <div className="order-card-header">
                                <div>
                                    <h4>Order #{order.order_id}</h4>
                                    <p className="order-date">
                                        {order.user_name} ({order.user_email}) ·{' '}
                                        {new Date(order.created_at).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="admin-order-controls">
                                    <span className={`status-badge status-${order.status}`}>
                                        {order.status}
                                    </span>
                                    <select
                                        aria-label={`Status for ${order.order_id}`}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                    >
                                        {ORDER_STATUSES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {order.status === 'pending' && (
                                        <button
                                            type="button"
                                            className="checkout-action"
                                            onClick={() => handleStatusChange(order.order_id, 'confirmed')}
                                        >
                                            Approve ✓
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="order-address">
                                <strong>Ship to:</strong> {order.shipping_address}
                            </p>

                            {Array.isArray(order.items) && (
                                <div className="order-items">
                                    {order.items.map((item) => (
                                        <div className="order-item-row" key={item.product_id}>
                                            <span>{item.name}</span>
                                            <small>{`${item.quantity} × ${formatINR(item.price)}`}</small>
                                            <strong>{formatINR(item.price * item.quantity)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="order-card-footer">
                                <span>Total</span>
                                <strong>{formatINR(order.total_amount)}</strong>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
