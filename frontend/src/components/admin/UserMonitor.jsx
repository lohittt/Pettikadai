import { useState, useEffect } from 'react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';

export function UserMonitor() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        PettikadaiAPI.getAdminUsers()
            .then((res) => {
                if (res?.success && Array.isArray(res.users)) {
                    setUsers(res.users);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page-section container">
            <div className="section-heading">
                <div>
                    <p className="subtitle">USER MANAGEMENT</p>
                    <h2>Registered Users ({users.length})</h2>
                </div>
            </div>

            <div className="admin-card">
                {loading ? (
                    <p>Loading users...</p>
                ) : users.length === 0 ? (
                    <p>No registered users found.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`role-badge role-${u.role}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString('en-IN')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
