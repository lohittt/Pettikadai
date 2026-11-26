import { useState, useCallback } from 'react';
import { PettikadaiAPI } from '../api/pettikadaiApi';

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [isPlacing, setIsPlacing] = useState(false);

    const placeOrder = useCallback(async (address, cart) => {
        const items = Object.entries(cart).map(([productId, quantity]) => ({
            productId,
            quantity
        }));

        setIsPlacing(true);
        try {
            const result = await PettikadaiAPI.placeOrder(address, items);
            if (result.success && result.order) {
                setOrders((prev) => [result.order, ...prev]);
            }
            return result;
        } finally {
            setIsPlacing(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        const result = await PettikadaiAPI.getOrders();
        if (result.success && Array.isArray(result.orders)) {
            setOrders(result.orders);
        }
        return result;
    }, []);

    return {
        orders,
        isPlacing,
        placeOrder,
        fetchOrders
    };
}
