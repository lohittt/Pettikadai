import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';

const STATUS_LABELS = {
    pending: 'Pending Approval',
    confirmed: 'Approved',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

export function Orders({ orders, loading, fetchOrders }) {
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">ORDER HISTORY</p>
                    <h2>My Orders</h2>
                </div>
                <button type="button" className="checkout-action" onClick={fetchOrders} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Status'}
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="empty-state">
                    <p>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <h3>No orders placed yet</h3>
                    <p>Explore our collection and place your first order.</p>
                    <Link to="/" className="primary-button" style={{ marginTop: '16px' }}>
                        Shop Now →
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article className="order-card" key={order.order_id || order.orderId}>
                            <div className="order-card-header">
                                <div>
                                    <h3>Order #{order.order_id || order.orderId}</h3>
                                    <p className="order-date">
                                        {order.created_at
                                            ? new Date(order.created_at).toLocaleString('en-IN')
                                            : 'Just now'}
                                    </p>
                                </div>
                                <span className={`status-badge status-${order.status || 'pending'}`}>
                                    {STATUS_LABELS[order.status] || order.status || 'Pending Approval'}
                                </span>
                            </div>

                            {order.shipping_address && (
                                <p className="order-address">
                                    <strong>Shipping Address:</strong> {order.shipping_address}
                                </p>
                            )}

                            {Array.isArray(order.items) && order.items.length > 0 && (
                                <div className="order-items">
                                    {order.items.map((item) => (
                                        <div className="order-item-row" key={item.product_id}>
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.name} />
                                            )}
                                            <div className="order-item-info">
                                                <span>{item.name}</span>
                                                <small>{`${item.quantity} × ${formatINR(item.price)}`}</small>
                                            </div>
                                            <strong>{formatINR(item.price * item.quantity)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="order-card-footer">
                                <span>Total Amount</span>
                                <strong>{formatINR(order.total_amount ?? order.totalAmount ?? 0)}</strong>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
