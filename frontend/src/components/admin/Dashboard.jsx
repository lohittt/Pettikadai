import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

const STATUS_VARIANTS = {
    pending: 'outline',
    confirmed: 'default',
    shipped: 'secondary',
    delivered: 'default',
    cancelled: 'destructive'
};

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
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Overview
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                </div>
                <Button type="button" variant="outline" onClick={loadDashboard} disabled={loading}>
                    <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading && !data ? (
                <Card className="py-12 text-center">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Loading dashboard metrics...</p>
                    </CardContent>
                </Card>
            ) : data ? (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link to="/admin/orders" className="block">
                            <Card className="h-full transition-colors hover:border-foreground/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                                        Total Orders
                                    </CardDescription>
                                    <CardTitle className="text-3xl">{data.orders.total}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    {data.orders.pending} pending approval
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/admin/orders" className="block">
                            <Card className="h-full transition-colors hover:border-foreground/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                                        Total Revenue
                                    </CardDescription>
                                    <CardTitle className="text-3xl">{formatINR(data.orders.totalRevenue)}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    {data.orders.confirmed + data.orders.shipped + data.orders.delivered} active/completed
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/admin/products" className="block">
                            <Card className="h-full transition-colors hover:border-foreground/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                                        Products
                                    </CardDescription>
                                    <CardTitle className="text-3xl">{data.products.total}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    {data.products.featured} featured on storefront
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/admin/users" className="block">
                            <Card className="h-full transition-colors hover:border-foreground/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                                        Registered Users
                                    </CardDescription>
                                    <CardTitle className="text-3xl">{data.users.total}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    {data.users.customers} customers · {data.users.admins} admins
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
                                <Button variant="outline" size="sm" render={<Link to="/admin/orders" />}>
                                    Manage →
                                </Button>
                            </CardHeader>
                            <CardContent className="flex flex-col divide-y">
                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                    <div className="flex items-center justify-between py-2.5 text-sm" key={status}>
                                        <Badge variant={STATUS_VARIANTS[status] || 'secondary'} className="capitalize">
                                            {status}
                                        </Badge>
                                        <strong>{data.orders[status] ?? 0}</strong>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Catalog by Category</CardTitle>
                                <Button variant="outline" size="sm" render={<Link to="/admin/products" />}>
                                    Manage →
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {data.products.byCategory.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No categories found.</p>
                                ) : (
                                    <div className="flex flex-col divide-y">
                                        {data.products.byCategory.map((row) => (
                                            <div className="flex items-center justify-between py-2.5 text-sm" key={row.category}>
                                                <span>{row.category}</span>
                                                <strong>{row.count} products</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Recent Orders</CardTitle>
                                <Button variant="outline" size="sm" render={<Link to="/admin/orders" />}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {data.recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No orders placed yet.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.recentOrders.map((o) => (
                                                <TableRow key={o.order_id}>
                                                    <TableCell className="font-semibold">{o.order_id}</TableCell>
                                                    <TableCell>{o.user_name}</TableCell>
                                                    <TableCell>{formatINR(o.total_amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={STATUS_VARIANTS[o.status] || 'secondary'} className="capitalize">
                                                            {o.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Recent Users</CardTitle>
                                <Button variant="outline" size="sm" render={<Link to="/admin/users" />}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {data.recentUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No users registered yet.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.recentUsers.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell>{u.name}</TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="uppercase">
                                                            {u.role}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
