import { useState, useEffect, useCallback } from 'react';
import { formatINR, ADDRESS_STORAGE_KEY } from '../utils/format';
import { validateAddress as validateAddressService, sanitizeInput } from '../services/validation';

function getAddressKey(userId) {
    return `${ADDRESS_STORAGE_KEY}_${userId}`;
}

function readUserAddress(userId) {
    if (!userId) return '';
    try {
        const raw = localStorage.getItem(getAddressKey(userId));
        return raw ? JSON.parse(raw) : '';
    } catch {
        return '';
    }
}

function saveUserAddress(userId, value) {
    if (!userId) return;
    try {
        localStorage.setItem(getAddressKey(userId), JSON.stringify(value));
    } catch {
        // Storage is optional; the current session still works.
    }
}

export function useCheckout({ cart, cartCount, cartTotal, clearCart, placeOrder, notify, isAuthenticated, userId }) {
    const [address, setAddress] = useState(() => readUserAddress(userId));
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    // Reset or reload address whenever the authenticated user changes (new registration, login switch, or logout)
    useEffect(() => {
        if (!userId || !isAuthenticated) {
            setAddress('');
            setIsCheckoutOpen(false);
            setIsAddressOpen(false);
            return;
        }
        setAddress(readUserAddress(userId));
    }, [userId, isAuthenticated]);

    const openCheckout = useCallback(() => {
        if (!isAuthenticated) {
            if (notify) notify('Please login to proceed to checkout');
            return;
        }
        if (!cartCount) return;
        setIsCheckoutOpen(true);
    }, [cartCount, isAuthenticated, notify]);

    const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
    const openAddressModal = useCallback(() => setIsAddressOpen(true), []);
    const closeAddressModal = useCallback(() => setIsAddressOpen(false), []);

    const validateAddress = useCallback((value) => {
        return validateAddressService(value);
    }, []);

    const saveAddress = useCallback(
        (value) => {
            const clean = sanitizeInput(value);
            setAddress(clean);
            saveUserAddress(userId, clean);
            setIsAddressOpen(false);
        },
        [userId]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!isAuthenticated) {
            if (notify) notify('Please login to place an order');
            return false;
        }
        if (!cartCount) return false;
        const addrError = validateAddressService(address);
        if (addrError) {
            alert(addrError);
            setIsAddressOpen(true);
            return false;
        }
        if (!window.confirm(`Place order for ${formatINR(cartTotal)}?`)) return false;

        try {
            const result = await placeOrder(sanitizeInput(address), cart);
            if (result.success) {
                if (notify) notify(`Order ${result.order.orderId} placed successfully! ✓`);
                clearCart();
                setIsCheckoutOpen(false);
                return true;
            } else {
                alert('Order failed: ' + (result.error || 'Unknown error'));
                return false;
            }
        } catch (err) {
            alert('Could not reach server. Order not saved.');
            console.error('Order network error:', err);
            return false;
        }
    }, [cart, cartCount, cartTotal, address, placeOrder, clearCart, notify, isAuthenticated]);

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
