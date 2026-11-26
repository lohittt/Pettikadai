import { useState, useEffect, useCallback } from 'react';
import { readStorage, saveStorage } from '../utils/format';
import { PettikadaiAPI } from '../api/pettikadaiApi';

function sanitizeWishlist(raw, productMap) {
    if (!Array.isArray(raw)) return [];
    return [...new Set(raw.filter((id) => productMap.has(id)))];
}

export function useWishlist(productMap) {
    const [wishlist, setWishlist] = useState(() => sanitizeWishlist(readStorage('wishlist', []), productMap));
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        saveStorage('wishlist', wishlist);
    }, [wishlist]);

    const toggleWishlist = useCallback((id) => {
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
        PettikadaiAPI.toggleWishlist(id).catch(console.error);
    }, []);

    const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

    return {
        wishlist,
        isOpen,
        openWishlist: () => setIsOpen(true),
        closeWishlist: () => setIsOpen(false),
        toggleWishlist,
        isWishlisted
    };
}
