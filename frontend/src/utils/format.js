export const MAX_QTY = 99;

export const STORAGE_KEYS = {
    cart: 'shopease_cart',
    wishlist: 'shopease_wishlist',
    address: 'shopease_address'
};

export function formatINR(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
}

export function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS[key]);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function saveStorage(key, value) {
    try {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch {
        // Storage is optional; the current session still works.
    }
}
