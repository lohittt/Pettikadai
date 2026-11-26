import { useState, useEffect, useCallback } from 'react';
import { formatINR, readStorage, saveStorage } from '../utils/format';

export function useCheckout({ cart, cartCount, cartTotal, clearCart, placeOrder, notify }) {
    const [address, setAddress] = useState(() => readStorage('address', ''));
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    useEffect(() => {
        saveStorage('address', address);
    }, [address]);

    const openCheckout = useCallback(() => {
        if (!cartCount) return;
        setIsCheckoutOpen(true);
    }, [cartCount]);

    const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
    const openAddressModal = useCallback(() => setIsAddressOpen(true), []);
    const closeAddressModal = useCallback(() => setIsAddressOpen(false), []);

    const validateAddress = useCallback((value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your shipping address.';
        if (trimmed.length < 5) return 'Address must contain at least 5 characters.';
        if (trimmed.length > 200) return 'Address cannot exceed 200 characters.';
        return '';
    }, []);

    const saveAddress = useCallback((value) => {
        setAddress(value.trim());
        setIsAddressOpen(false);
    }, []);

    const handlePlaceOrder = useCallback(async () => {
        if (!cartCount) return;
        if (!address || address.trim().length < 5) {
            alert('Please add a delivery address before placing the order.');
            setIsAddressOpen(true);
            return;
        }
        if (!window.confirm(`Place order for ${formatINR(cartTotal)}?`)) return;

        try {
            const result = await placeOrder(address, cart);
            if (result.success) {
                if (notify) notify(`Order ${result.order.orderId} placed successfully! ✓`);
                clearCart();
                setIsCheckoutOpen(false);
            } else {
                alert('Order failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Could not reach server. Order not saved.');
            console.error('Order network error:', err);
        }
    }, [cart, cartCount, cartTotal, address, placeOrder, clearCart, notify]);

    return {
        address,
        isCheckoutOpen,
        isAddressOpen,
        openCheckout,
        closeCheckout,
        openAddressModal,
        closeAddressModal,
        validateAddress,
        saveAddress,
        handlePlaceOrder
    };
}
