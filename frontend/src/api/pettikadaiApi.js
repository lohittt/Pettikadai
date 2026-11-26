const BASE_URL = 'http://localhost:3000/api';

function getSessionId() {
    let sid = localStorage.getItem('pettikadai_session_id');
    if (!sid) {
        sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('pettikadai_session_id', sid);
    }
    return sid;
}

const sessionId = getSessionId();

async function request(endpoint, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return await res.json();
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        return { success: false, error: err.message };
    }
}

export const PettikadaiAPI = {
    sessionId,

    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/products${query ? '?' + query : ''}`);
    },

    getProduct: (productId) => request(`/products/${productId}`),

    getCategories: () => request('/categories'),

    getCart: () => request(`/cart/${sessionId}`),

    addToCart: (productId, quantity = 1) =>
        request('/cart', {
            method: 'POST',
            body: JSON.stringify({ sessionId, productId, quantity })
        }),

    updateCartQty: (productId, quantity) =>
        request('/cart', {
            method: 'PATCH',
            body: JSON.stringify({ sessionId, productId, quantity })
        }),

    removeFromCart: (productId) =>
        request(`/cart/${sessionId}/${productId}`, { method: 'DELETE' }),

    clearCart: () =>
        request(`/cart/${sessionId}`, { method: 'DELETE' }),

    getWishlist: () => request(`/wishlist/${sessionId}`),

    toggleWishlist: (productId) =>
        request('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ sessionId, productId })
        }),

    removeFromWishlist: (productId) =>
        request(`/wishlist/${sessionId}/${productId}`, { method: 'DELETE' }),

    placeOrder: (address, items = []) =>
        request('/orders', {
            method: 'POST',
            body: JSON.stringify({ sessionId, address, items })
        }),

    getOrders: () => request(`/orders/${sessionId}`),

    getOrder: (orderId) => request(`/orders/detail/${orderId}`),

    health: () => request('/health')
};
