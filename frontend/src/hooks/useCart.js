import { useState, useEffect, useMemo, useCallback } from 'react';
import { MAX_QTY } from '../utils/format';
import { PettikadaiAPI } from '../api/pettikadaiApi';

export function useCart(productMap, notify, isAuthenticated) {
    const [cart, setCart] = useState({});

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart({});
            return;
        }
        const res = await PettikadaiAPI.getCart();
        if (res?.success && Array.isArray(res.cart)) {
            const next = {};
            for (const item of res.cart) {
                next[item.product_id] = Math.max(1, Math.min(MAX_QTY, Number(item.quantity) || 1));
            }
            setCart(next);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = useCallback(
        async (id, quantity = 1) => {
            if (!isAuthenticated) {
                if (notify) notify('Please login to add items to your cart');
                return false;
            }
            const product = productMap.get(id);
            if (!product) return false;

            setCart((prev) => {
                const next = Math.min((prev[id] || 0) + quantity, MAX_QTY);
                return { ...prev, [id]: next };
            });

            if (notify) notify(`${product.name} added to cart ✓`);
            const res = await PettikadaiAPI.addToCart(id, quantity);
            if (!res?.success) {
                refreshCart();
                return false;
            }
            return true;
        },
        [productMap, notify, isAuthenticated, refreshCart]
    );

    const updateQuantity = useCallback(
        async (id, value) => {
            if (!isAuthenticated) return;
            const quantity = Math.max(1, Math.min(MAX_QTY, Math.floor(value) || 1));
            setCart((prev) => ({ ...prev, [id]: quantity }));
            await PettikadaiAPI.updateCartQty(id, quantity);
        },
        [isAuthenticated]
    );

    const removeFromCart = useCallback(
        async (id) => {
            if (!isAuthenticated) return;
            setCart((prev) => {
                const { [id]: _, ...remaining } = prev;
                return remaining;
            });
            await PettikadaiAPI.removeFromCart(id);
        },
        [isAuthenticated]
    );

    const clearCart = useCallback(() => {
        setCart({});
    }, []);

    const cartCount = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

    const cartTotal = useMemo(
        () =>
            Object.entries(cart).reduce((sum, [id, qty]) => {
                const product = productMap.get(id);
                return sum + (product ? product.price * qty : 0);
            }, 0),
        [cart, productMap]
    );

    return {
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
    };
}
