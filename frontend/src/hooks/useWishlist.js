import { useState, useEffect, useCallback } from 'react';
import { PettikadaiAPI } from '../api/pettikadaiApi';

export function useWishlist(notify, isAuthenticated) {
    const [wishlist, setWishlist] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlist([]);
            return;
        }
        const res = await PettikadaiAPI.getWishlist();
        if (res?.success && Array.isArray(res.wishlist)) {
            setWishlist(res.wishlist.map((item) => item.product_id));
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    const toggleWishlist = useCallback(
        async (id) => {
            if (!isAuthenticated) {
                if (notify) notify('Please login to save items to your wishlist');
                return;
            }
            setWishlist((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            );
            const res = await PettikadaiAPI.toggleWishlist(id);
            if (res?.success && notify) {
                notify(res.message);
            } else if (!res?.success) {
                refreshWishlist();
            }
        },
        [isAuthenticated, notify, refreshWishlist]
    );

    const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

    return {
        wishlist,
        isOpen,
        openWishlist: () => setIsOpen(true),
        closeWishlist: () => setIsOpen(false),
        toggleWishlist,
        isWishlisted,
        refreshWishlist
    };
}
