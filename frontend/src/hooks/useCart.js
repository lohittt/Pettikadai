import { useState, useEffect, useMemo, useCallback } from 'react';
import { MAX_QTY, readStorage, saveStorage } from '../utils/format';
import { PettikadaiAPI } from '../api/pettikadaiApi';

function sanitizeCart(raw, productMap) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(
        Object.entries(raw)
            .map(([id, qty]) => [id, Math.max(0, Math.min(MAX_QTY, Number(qty) || 0))])
            .filter(([id, qty]) => productMap.has(id) && qty > 0)
    );
}

export function useCart(productMap, notify) {
    const [cart, setCart] = useState(() => sanitizeCart(readStorage('cart', {}), productMap));

    useEffect(() => {
        saveStorage('cart', cart);
    }, [cart]);

    const addToCart = useCallback(
        (id, quantity = 1) => {
            const product = productMap.get(id);
            if (!product) return;

            setCart((prev) => {
                const next = Math.min((prev[id] || 0) + quantity, MAX_QTY);
                return { ...prev, [id]: next };
            });

            if (notify) notify(`${product.name} added to cart ✓`);
            PettikadaiAPI.addToCart(id, quantity).catch(console.error);
        },
        [productMap, notify]
    );

    const updateQuantity = useCallback((id, value) => {
        const quantity = Math.max(1, Math.min(MAX_QTY, Math.floor(value) || 1));
        setCart((prev) => ({ ...prev, [id]: quantity }));
        PettikadaiAPI.updateCartQty(id, quantity).catch(console.error);
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart((prev) => {
            const { [id]: _, ...remaining } = prev;
            return remaining;
        });
        PettikadaiAPI.removeFromCart(id).catch(console.error);
    }, []);

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
        clearCart
    };
}
