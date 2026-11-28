import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { formatINR } from '../../utils/format';

export function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await PettikadaiAPI.getAdminDashboard();
            if (res?.success && res.dashboard) {
                setData(res.dashboard);
            } else {
                setError(res?.error || 'Failed to load dashboard metrics.');
            }
        } catch {
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">OVERVIEW</p>
                    <h2>Admin Dashboard</h2>
                </div>
                <button
                    type="button"
                    className="checkout-action"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            {loading && !data ? (
                <div className="empty-state">
                    <p>Loading dashboard metrics...</p>
                </div>
            ) : data ? (
                <>
                    <div className="dashboard-kpi-grid">
                        <Link to="/admin/orders" className="kpi-card">
                            <span className="kpi-label">Total Orders</span>
                            <strong className="kpi-value">{data.orders.total}</strong>
                            <small className="kpi-sub">
                                {data.orders.pending} pending approval
                            </small>
                        </Link>

                        <Link to="/admin/orders" className="kpi-card">
                            <span className="kpi-label">Total Revenue</span>
                            <strong className="kpi-value">{formatINR(data.orders.totalRevenue)}</strong>
                            <small className="kpi-sub">
                                {data.orders.confirmed + data.orders.shipped + data.orders.delivered} active/completed
                            </small>
                        </Link>

                        <Link to="/admin/products" className="kpi-card">
                            <span className="kpi-label">Products</span>
                            <strong className="kpi-value">{data.products.total}</strong>
                            <small className="kpi-sub">
                                {data.products.featured} featured on storefront
                            </small>
                        </Link>

                        <Link to="/admin/users" className="kpi-card">
                            <span className="kpi-label">Registered Users</span>
                            <strong className="kpi-value">{data.users.total}</strong>
                            <small className="kpi-sub">
                                {data.users.customers} customers · {data.users.admins} admins
                            </small>
                        </Link>
                    </div>

                    <div className="dashboard-panels">
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3>Order Status Breakdown</h3>
                                <Link to="/admin/orders" className="checkout-action">Manage →</Link>
                            </div>
                            <div className="status-breakdown-list">
                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                    <div className="breakdown-row" key={status}>
                                        <span className={`status-badge status-${status}`}>{status}</span>
                                        <strong>{data.orders[status] ?? 0}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3>Catalog by Category</h3>
                                <Link to="/admin/products" className="checkout-action">Manage →</Link>
                            </div>
                            {data.products.byCategory.length === 0 ? (
                                <p>No categories found.</p>
                            ) : (
                                <div className="status-breakdown-list">
                                    {data.products.byCategory.map((row) => (
                                        <div className="breakdown-row" key={row.category}>
                                            <span>{row.category}</span>
                                            <strong>{row.count} products</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panels" style={{ marginTop: '24px' }}>
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3>Recent Orders</h3>
                                <Link to="/admin/orders" className="checkout-action">View All</Link>
                            </div>
                            {data.recentOrders.length === 0 ? (
                                <p className="dashboard-muted">No orders placed yet.</p>
                            ) : (
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentOrders.map((o) => (
                                                <tr key={o.order_id}>
                                                    <td><strong>{o.order_id}</strong></td>
                                                    <td>{o.user_name}</td>
                                                    <td>{formatINR(o.total_amount)}</td>
                                                    <td>
                                                        <span className={`status-badge status-${o.status}`}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3>Recent Users</h3>
                                <Link to="/admin/users" className="checkout-action">View All</Link>
                            </div>
                            {data.recentUsers.length === 0 ? (
                                <p className="dashboard-muted">No users registered yet.</p>
                            ) : (
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentUsers.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-${u.role}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}
