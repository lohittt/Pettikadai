const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        const data = await res.json();
        if (!res.ok && data.success === undefined) {
            return { success: false, status: res.status, error: data.error || 'Request failed' };
        }
        return { ...data, status: res.status };
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        return { success: false, error: err.message };
    }
}

export const PettikadaiAPI = {

    // Auth
    register: (name, email, password) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        }),

    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    logout: () =>
        request('/auth/logout', { method: 'POST' }),

    getMe: () => request('/auth/me'),

    // Products & Categories
    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/products${query ? '?' + query : ''}`);
    },

    getProduct: (productId) => request(`/products/${productId}`),

    getCategories: () => request('/categories'),

    // Cart (authenticated user)
    getCart: () => request('/cart'),

    addToCart: (productId, quantity = 1) =>
        request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        }),

    updateCartQty: (productId, quantity) =>
        request('/cart', {
            method: 'PATCH',
            body: JSON.stringify({ productId, quantity })
        }),

    removeFromCart: (productId) =>
        request(`/cart/item/${productId}`, { method: 'DELETE' }),

    clearCart: () =>
        request('/cart', { method: 'DELETE' }),

    // Wishlist (authenticated user)
    getWishlist: () => request('/wishlist'),

    toggleWishlist: (productId) =>
        request('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId })
        }),

    removeFromWishlist: (productId) =>
        request(`/wishlist/${productId}`, { method: 'DELETE' }),

    // Orders (authenticated user)
    placeOrder: (address, items = []) =>
        request('/orders', {
            method: 'POST',
            body: JSON.stringify({ address, items })
        }),

    getOrders: () => request('/orders'),

    getOrder: (orderId) => request(`/orders/detail/${orderId}`),

    // Admin
    createProduct: (productData) =>
        request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        }),

    updateProduct: (productId, productData) =>
        request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        }),

    toggleProductFeatured: (productId, isFeatured) =>
        request(`/products/${productId}/featured`, {
            method: 'PATCH',
            body: JSON.stringify({ is_featured: isFeatured })
        }),

    deleteProduct: (productId) =>
        request(`/products/${productId}`, { method: 'DELETE' }),

    getAdminDashboard: () => request('/admin/dashboard'),

    getAdminUsers: () => request('/admin/users'),

    getAdminOrders: () => request('/admin/orders'),

    updateOrderStatus: (orderId, status) =>
        request(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        }),

    health: () => request('/health')
};
