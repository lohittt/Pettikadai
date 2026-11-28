import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { PettikadaiAPI } from '../../api/pettikadaiApi';
import { formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_BADGE_CLASSES = {
    pending: 'bg-primary-soft text-on-primary-soft',
    confirmed: 'bg-primary text-primary-foreground',
    shipped: 'bg-surface-container border border-border text-foreground',
    delivered: 'bg-secondary text-secondary-foreground',
    cancelled: 'bg-accent-soft text-on-accent-soft'
};

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
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Order Management
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">Customer Orders ({orders.length})</h2>
                </div>
                <Button type="button" variant="outline" onClick={loadOrders} disabled={loading}>
                    <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {loading && orders.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Loading orders...</p>
                    </CardContent>
                </Card>
            ) : orders.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent className="flex flex-col items-center gap-2">
                        <h3 className="text-xl font-semibold">No customer orders yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Orders placed by customers will appear here for approval.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-5">
                    {orders.map((order) => (
                        <Card key={order.order_id}>
                            <CardHeader className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-start">
                                <div>
                                    <CardTitle className="text-lg">Order #{order.order_id}</CardTitle>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {order.user_name} ({order.user_email}) ·{' '}
                                        {new Date(order.created_at).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={`rounded-full capitalize ${STATUS_BADGE_CLASSES[order.status] || ''}`}>
                                        {order.status}
                                    </Badge>
                                    <Select
                                        value={order.status}
                                        onValueChange={(val) => handleStatusChange(order.order_id, val)}
                                    >
                                        <SelectTrigger aria-label={`Status for ${order.order_id}`} className="w-36 capitalize">
                                            <SelectValue>{order.status}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {ORDER_STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s} className="capitalize">
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {order.status === 'pending' && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleStatusChange(order.order_id, 'confirmed')}
                                        >
                                            <Check data-icon="inline-start" />
                                            Approve
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex flex-col gap-3 pt-4">
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">Ship to:</strong> {order.shipping_address}
                                </p>

                                {Array.isArray(order.items) && (
                                    <div className="flex flex-col gap-2">
                                        {order.items.map((item) => (
                                            <div className="flex items-center justify-between gap-3 text-sm" key={item.product_id}>
                                                <span className="flex-1 truncate font-medium">{item.name}</span>
                                                <small className="text-xs text-muted-foreground">
                                                    {`${item.quantity} × ${formatINR(item.price)}`}
                                                </small>
                                                <strong>{formatINR(item.price * item.quantity)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>

                            <Separator />

                            <CardFooter className="justify-between py-4">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <strong className="text-base">{formatINR(order.total_amount)}</strong>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
