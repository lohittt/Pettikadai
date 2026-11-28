import { useState, useEffect, useRef } from 'react';
import { X, Lock } from 'lucide-react';
import { MAX_QTY, formatINR } from '../../utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export function Cart({
    cart,
    productMap,
    cartTotal,
    onUpdateQuantity,
    onRemoveFromCart,
    address,
    isCheckoutOpen,
    isAddressOpen,
    onOpenCheckout,
    onCloseCheckout,
    onOpenAddress,
    onCloseAddress,
    validateAddress,
    onSaveAddress,
    onPlaceOrder,
    isPlacing
}) {
    const entries = Object.entries(cart).filter(([id]) => productMap.has(id));
    const [addressDraft, setAddressDraft] = useState(address);
    const addressInputRef = useRef(null);

    useEffect(() => {
        if (isAddressOpen) {
            setAddressDraft(address);
            setTimeout(() => addressInputRef.current?.focus(), 0);
        }
    }, [isAddressOpen, address]);

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const errorMsg = validateAddress(addressDraft);
        if (errorMsg && addressInputRef.current) {
            addressInputRef.current.setCustomValidity(errorMsg);
            addressInputRef.current.reportValidity();
            return;
        }
        onSaveAddress(addressDraft);
    };

    return (
        <>
            <section className="container py-14" id="cart">
                <h2 className="mb-8 text-3xl font-bold tracking-tight uppercase">Shopping Cart</h2>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">Remove</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody id="cart-items">
                                {entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                            Your cart is currently empty.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entries.map(([id, quantity]) => {
                                        const product = productMap.get(id);
                                        return (
                                            <TableRow key={id} data-product-id={id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="size-16 rounded-md bg-muted object-contain"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                                                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatINR(product.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={quantity}
                                                        min={1}
                                                        max={MAX_QTY}
                                                        aria-label="Product quantity"
                                                        className="w-20 text-center"
                                                        onChange={(e) => onUpdateQuantity(id, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatINR(product.price * quantity)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        data-action="remove"
                                                        aria-label="Remove item"
                                                        onClick={() => onRemoveFromCart(id)}
                                                    >
                                                        <X />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {entries.length > 0 && (
                        <CardFooter className="flex flex-wrap items-center justify-end gap-6 border-t py-5" id="cart-summary">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Grand Total:</span>
                                <strong id="cart-grand-total" className="text-xl font-bold">
                                    {formatINR(cartTotal)}
                                </strong>
                            </div>
                            <Button
                                type="button"
                                id="checkout-button"
                                size="lg"
                                onClick={onOpenCheckout}
                            >
                                Checkout →
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </section>

            {/* Checkout Modal */}
            <Dialog
                open={isCheckoutOpen}
                onOpenChange={(open) => {
                    if (!open) onCloseCheckout();
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" id="checkout-modal">
                    <DialogHeader>
                        <DialogTitle id="checkout-title" className="text-2xl">Checkout</DialogTitle>
                        <DialogDescription>Review your order before placing it.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-base font-semibold">Order Summary</h3>
                            <div className="flex flex-col divide-y" id="checkout-products">
                                {entries.map(([id, quantity]) => {
                                    const product = productMap.get(id);
                                    return (
                                        <div className="flex items-center gap-3 py-3" key={id}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="size-12 rounded-md bg-muted object-contain"
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
                            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                <span className="text-sm font-medium">Grand Total</span>
                                <strong id="checkout-total" className="text-lg text-red-600">
                                    {formatINR(cartTotal)}
                                </strong>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-base font-semibold">Customer Information</h3>
                            <Card>
                                <CardContent className="flex items-center justify-between gap-3 py-4">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold">Delivery Address</h4>
                                        <p className="text-xs text-muted-foreground break-words">
                                            {address || 'Add your shipping address.'}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={onOpenAddress}
                                    >
                                        {address ? 'Edit Address' : 'Add Address'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Button
                                type="button"
                                className="w-full"
                                size="lg"
                                disabled={isPlacing}
                                onClick={onPlaceOrder}
                            >
                                {isPlacing ? 'Placing Order...' : 'Place Order →'}
                            </Button>

                            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                <Lock className="size-3.5" />
                                Your checkout information is protected.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Address Modal */}
            <Dialog
                open={isAddressOpen}
                onOpenChange={(open) => {
                    if (!open) onCloseAddress();
                }}
            >
                <DialogContent className="sm:max-w-md" id="address-modal">
                    <DialogHeader>
                        <DialogTitle id="address-title">Delivery Address</DialogTitle>
                        <DialogDescription>Enter the address for this order.</DialogDescription>
                    </DialogHeader>

                    <form id="address-form" onSubmit={handleAddressSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="address-input">Address</Label>
                            <Textarea
                                ref={addressInputRef}
                                id="address-input"
                                rows={4}
                                required
                                value={addressDraft}
                                onChange={(e) => {
                                    e.target.setCustomValidity('');
                                    setAddressDraft(e.target.value);
                                }}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Save Address
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
