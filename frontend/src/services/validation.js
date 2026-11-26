/**
 * Client-side input sanitization and validation utilities.
 * Strips HTML/script tags to help prevent XSS before sending to API.
 */

export function sanitizeInput(value) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim();
}

export function validateName(name) {
    const clean = sanitizeInput(name);
    if (!clean) return 'Name is required.';
    if (clean.length < 2) return 'Name must be at least 2 characters.';
    if (clean.length > 100) return 'Name cannot exceed 100 characters.';
    return '';
}

export function validateEmail(email) {
    const clean = sanitizeInput(email);
    if (!clean) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        return 'Please enter a valid email address.';
    }
    return '';
}

export function validatePassword(password) {
    if (typeof password !== 'string' || !password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password.length > 128) return 'Password cannot exceed 128 characters.';
    return '';
}

export function validateAddress(address) {
    const clean = sanitizeInput(address);
    if (!clean) return 'Please enter your shipping address.';
    if (clean.length < 5) return 'Address must contain at least 5 characters.';
    if (clean.length > 500) return 'Address cannot exceed 500 characters.';
    return '';
}
