/**
 * Input validation and sanitization utilities.
 * Prevents XSS by stripping HTML tags and dangerous characters.
 */

/**
 * Strip HTML tags from a string to prevent stored XSS.
 */
function stripHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate email format.
 */
function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate name: 2-100 chars, no HTML.
 */
function validateName(name) {
    const clean = stripHtml(name);
    if (!clean || clean.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (clean.length > 100) return { valid: false, error: 'Name cannot exceed 100 characters' };
    return { valid: true, value: clean };
}

/**
 * Validate email input.
 */
function validateEmail(email) {
    const clean = stripHtml(email);
    if (!clean) return { valid: false, error: 'Email is required' };
    if (!isValidEmail(clean)) return { valid: false, error: 'Invalid email format' };
    if (clean.length > 255) return { valid: false, error: 'Email is too long' };
    return { valid: true, value: clean.toLowerCase() };
}

/**
 * Validate password: min 6 chars.
 */
function validatePassword(password) {
    if (typeof password !== 'string') return { valid: false, error: 'Password is required' };
    if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    if (password.length > 128) return { valid: false, error: 'Password is too long' };
    return { valid: true, value: password };
}

/**
 * Validate shipping address.
 */
function validateAddress(address) {
    const clean = stripHtml(address);
    if (!clean || clean.length < 5) return { valid: false, error: 'Address must be at least 5 characters' };
    if (clean.length > 500) return { valid: false, error: 'Address cannot exceed 500 characters' };
    return { valid: true, value: clean };
}

/**
 * Validate product fields for admin CRUD.
 */
function validateProduct(data) {
    const errors = [];
    const clean = {};

    const name = stripHtml(data.name);
    if (!name || name.length < 2) errors.push('Product name must be at least 2 characters');
    clean.name = name;

    const brand = stripHtml(data.brand);
    if (!brand) errors.push('Brand is required');
    clean.brand = brand;

    const price = Number(data.price);
    if (!price || price <= 0) errors.push('Price must be a positive number');
    clean.price = price;

    const imageUrl = stripHtml(data.image_url || data.imageUrl || '');
    if (!imageUrl || !/^https?:\/\/.+/i.test(imageUrl)) {
        errors.push('Image URL must be a valid http:// or https:// URL');
    }
    clean.image_url = imageUrl;

    clean.description = stripHtml(data.description || '');
    clean.category_id = Number(data.category_id || data.categoryId);

    if (!clean.category_id) errors.push('Category is required');

    if (errors.length > 0) return { valid: false, errors };
    return { valid: true, value: clean };
}

module.exports = {
    stripHtml,
    isValidEmail,
    validateName,
    validateEmail,
    validatePassword,
    validateAddress,
    validateProduct
};
