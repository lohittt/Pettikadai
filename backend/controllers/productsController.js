const db = require('../db/connection');
const crypto = require('crypto');
const { validateProduct } = require('../services/validationService');

function generateProductId(name) {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'product';
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${slug}-${suffix}`;
}

/**
 * List all products with optional category, search, and sort filters.
 */
async function getProducts(req, res) {
    try {
        const { category, search, sort } = req.query;

        let sql = `
            SELECT p.product_id, p.name, p.brand, c.name AS category,
                   p.price, p.image_url, p.description
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (category && category !== 'All') {
            sql += ' AND c.name = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND (p.name LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        switch (sort) {
            case 'low-high':
                sql += ' ORDER BY p.price ASC';
                break;
            case 'high-low':
                sql += ' ORDER BY p.price DESC';
                break;
            case 'name':
                sql += ' ORDER BY p.name ASC';
                break;
            default:
                sql += ' ORDER BY p.id ASC';
        }

        const [rows] = await db.query(sql, params);
        res.json({ success: true, count: rows.length, products: rows });
    } catch (err) {
        console.error('GET /api/products error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
}

/**
 * Get single product details by product_id.
 */
async function getProductById(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT p.product_id, p.name, p.brand, c.name AS category,
                    p.price, p.image_url, p.description
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.product_id = ?`,
            [req.params.productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product: rows[0] });
    } catch (err) {
        console.error('GET /api/products/:id error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch product' });
    }
}

/**
 * POST /api/products — Create a new product (admin only).
 */
async function createProduct(req, res) {
    try {
        const result = validateProduct(req.body);
        if (!result.valid) {
            return res.status(400).json({ success: false, errors: result.errors });
        }

        const { name, brand, category_id, price, image_url, description } = result.value;

        const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (cat.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category_id' });
        }

        const product_id = generateProductId(name);

        await db.query(
            `INSERT INTO products (product_id, name, brand, category_id, price, image_url, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, name, brand, category_id, price, image_url, description]
        );

        res.status(201).json({ success: true, message: 'Product created', product_id });
    } catch (err) {
        console.error('POST /api/products error:', err);
        res.status(500).json({ success: false, error: 'Failed to create product' });
    }
}

/**
 * PUT /api/products/:productId — Update a product (admin only).
 */
async function updateProduct(req, res) {
    try {
        const result = validateProduct(req.body);
        if (!result.valid) {
            return res.status(400).json({ success: false, errors: result.errors });
        }

        const { name, brand, category_id, price, image_url, description } = result.value;

        const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (cat.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category_id' });
        }

        const [updateResult] = await db.query(
            `UPDATE products SET name = ?, brand = ?, category_id = ?, price = ?, image_url = ?, description = ?
             WHERE product_id = ?`,
            [name, brand, category_id, price, image_url, description, req.params.productId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated' });
    } catch (err) {
        console.error('PUT /api/products error:', err);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
}

/**
 * DELETE /api/products/:productId — Delete a product (admin only).
 */
async function deleteProduct(req, res) {
    try {
        const [result] = await db.query(
            'DELETE FROM products WHERE product_id = ?',
            [req.params.productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        console.error('DELETE /api/products error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
