import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { validateAddress, sanitizeInput } from '../../services/validation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export function CheckoutPage({
    cart,
    productMap,
    cartTotal,
    address,
    onSaveAddress,
    placeOrder,
    clearCart,
    isPlacing,
    notify
}) {
    const entries = Object.entries(cart).filter(([id]) => productMap.has(id));
    const [addressInput, setAddressInput] = useState(address || '');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setAddressInput(address || '');
    }, [address]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanAddress = sanitizeInput(addressInput);
        const addrErr = validateAddress(cleanAddress);
        if (addrErr) {
            return setError(addrErr);
        }

        onSaveAddress(cleanAddress);

        try {
            const result = await placeOrder(cleanAddress, cart);
            if (result.success) {
                if (notify) notify(`Order ${result.order.orderId} placed successfully! ✓`);
                clearCart();
                navigate('/orders');
            } else {
                setError(result.error || 'Failed to place order.');
            }
        } catch {
            setError('Could not reach server. Please try again.');
        }
    };

    return (
        <section className="container min-h-[60vh] py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Finalize Order
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
                </div>
                <Button variant="outline" render={<Link to="/" />}>
                    ← Back to Store
                </Button>
            </div>

            {entries.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                        <h3 className="text-xl font-semibold">Your cart is empty</h3>
                        <p className="text-sm text-muted-foreground">
                            Add items to your cart before checking out.
                        </p>
                        <Button render={<Link to="/" />} className="mt-2">
                            Shop Now →
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col divide-y">
                                {entries.map(([id, quantity]) => {
                                    const product = productMap.get(id);
                                    return (
                                        <div className="flex items-center gap-4 py-3" key={id}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="size-14 rounded-md bg-muted object-contain"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="truncate text-sm font-semibold">{product.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {`${quantity} × ${formatINR(product.price)}`}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {formatINR(product.price * quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                <span className="text-sm font-medium">Grand Total</span>
                                <strong className="text-lg text-red-600">{formatINR(cartTotal)}</strong>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Details</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="checkout-address">Delivery Address</Label>
                                    <Textarea
                                        id="checkout-address"
                                        rows={4}
                                        value={addressInput}
                                        onChange={(e) => setAddressInput(e.target.value)}
                                        placeholder="House no., Street, City, State, PIN code"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={isPlacing}
                                >
                                    {isPlacing ? 'Placing Order...' : `Place Order (${formatINR(cartTotal)}) →`}
                                </Button>
                                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                    <Lock className="size-3.5" />
                                    Your checkout information is protected.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
}
