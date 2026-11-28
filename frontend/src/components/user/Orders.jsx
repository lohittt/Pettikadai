import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const STATUS_LABELS = {
    pending: 'Pending Approval',
    confirmed: 'Approved',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

const STATUS_VARIANTS = {
    pending: 'outline',
    confirmed: 'default',
    shipped: 'secondary',
    delivered: 'default',
    cancelled: 'destructive'
};

export function Orders({ orders, loading, fetchOrders }) {
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Order History
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
                </div>
                <Button type="button" variant="outline" onClick={fetchOrders} disabled={loading}>
                    <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh Status'}
                </Button>
            </div>

            {loading && orders.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Loading your orders...</p>
                    </CardContent>
                </Card>
            ) : orders.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                        <h3 className="text-xl font-semibold">No orders placed yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Explore our collection and place your first order.
                        </p>
                        <Button render={<Link to="/" />} className="mt-2">
                            Shop Now →
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-5">
                    {orders.map((order) => {
                        const status = order.status || 'pending';
                        return (
                            <Card key={order.order_id || order.orderId}>
                                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b pb-4">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Order #{order.order_id || order.orderId}
                                        </CardTitle>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleString('en-IN')
                                                : 'Just now'}
                                        </p>
                                    </div>
                                    <Badge variant={STATUS_VARIANTS[status] || 'secondary'}>
                                        {STATUS_LABELS[status] || status}
                                    </Badge>
                                </CardHeader>

                                <CardContent className="flex flex-col gap-3 pt-4">
                                    {order.shipping_address && (
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">Shipping Address:</strong>{' '}
                                            {order.shipping_address}
                                        </p>
                                    )}

                                    {Array.isArray(order.items) && order.items.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {order.items.map((item) => (
                                                <div className="flex items-center gap-3 text-sm" key={item.product_id}>
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="size-12 rounded-md bg-muted object-contain"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-medium">{item.name}</p>
                                                        <small className="text-xs text-muted-foreground">
                                                            {`${item.quantity} × ${formatINR(item.price)}`}
                                                        </small>
                                                    </div>
                                                    <strong>{formatINR(item.price * item.quantity)}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>

                                <Separator />

                                <CardFooter className="justify-between py-4">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <strong className="text-base">
                                        {formatINR(order.total_amount ?? order.totalAmount ?? 0)}
                                    </strong>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
