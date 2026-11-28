import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, X, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { validateAddress, sanitizeInput } from '../../services/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    const [editingAddress, setEditingAddress] = useState(!address);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setAddressInput(address || '');
        if (!address) setEditingAddress(true);
    }, [address]);

    const handleSaveInlineAddress = () => {
        setError('');
        const cleanAddress = sanitizeInput(addressInput);
        const addrErr = validateAddress(cleanAddress);
        if (addrErr) {
            return setError(addrErr);
        }
        onSaveAddress(cleanAddress);
        setEditingAddress(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanAddress = sanitizeInput(editingAddress ? addressInput : (address || addressInput));
        const addrErr = validateAddress(cleanAddress);
        if (addrErr) {
            setEditingAddress(true);
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
        <section className="container flex min-h-[60vh] items-start justify-center py-10">
            <Card className="w-full max-w-4xl rounded-2xl border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="font-headline text-3xl font-bold text-foreground">Checkout</h1>
                        <p className="text-sm text-muted-foreground">Review your order before placing it.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-background"
                        aria-label="Back to catalog"
                        render={<Link to="/products" />}
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                {entries.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <h3 className="text-xl font-semibold">Your cart is empty</h3>
                        <p className="text-sm text-muted-foreground">
                            Add items to your cart before checking out.
                        </p>
                        <Button className="mt-2 rounded-full hover:bg-secondary" render={<Link to="/" />}>
                            Shop Now →
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 pt-6 md:grid-cols-12">
                        {/* Left Column: Order Summary */}
                        <div className="flex flex-col justify-between gap-6 md:col-span-6">
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                                    Order Summary
                                </h2>
                                <div className="divide-y divide-border">
                                    {entries.map(([id, quantity]) => {
                                        const product = productMap.get(id);
                                        return (
                                            <div className="flex items-center justify-between gap-3 py-3.5" key={id}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="size-12 shrink-0 rounded-lg border border-border object-cover"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground tabular-nums">
                                                            {`${quantity} × ${formatINR(product.price)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                                                    {formatINR(product.price * quantity)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5">
                                <span className="text-sm font-semibold text-foreground">Grand Total</span>
                                <span className="text-2xl font-bold text-destructive tabular-nums">
                                    {formatINR(cartTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Customer Information */}
                        <div className="flex flex-col gap-5 md:col-span-6">
                            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                                Customer Information
                            </h2>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">Delivery Address</p>
                                        <p className="text-xs text-muted-foreground break-words">
                                            {address || 'Add your shipping address.'}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 bg-card hover:bg-surface-container"
                                        onClick={() => setEditingAddress((prev) => !prev)}
                                    >
                                        {editingAddress ? 'Close' : (address ? 'Edit Address' : 'Add Address')}
                                    </Button>
                                </div>

                                {editingAddress && (
                                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                                        <Input
                                            id="checkout-address"
                                            type="text"
                                            value={addressInput}
                                            onChange={(e) => setAddressInput(e.target.value)}
                                            placeholder="House no., Street, City, State, PIN code"
                                            aria-label="Edit delivery address"
                                            className="bg-card"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleSaveInlineAddress}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full rounded-full py-6 text-sm font-semibold hover:bg-secondary"
                                disabled={isPlacing}
                            >
                                {isPlacing ? 'Placing Order...' : `Place Order (${formatINR(cartTotal)})`}
                                <ArrowRight data-icon="inline-end" />
                            </Button>

                            <p className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
                                <Lock className="size-3.5" />
                                <span>Your checkout information is protected.</span>
                            </p>
                        </div>
                    </form>
                )}
            </Card>
        </section>
    );
}
