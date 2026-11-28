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

function formatProductRow(row) {
    return {
        ...row,
        is_featured: Boolean(row.is_featured)
    };
}

/**
 * List all products with optional category, search, featured, and sort filters.
 */
async function getProducts(req, res) {
    try {
        const { category, search, sort, featured } = req.query;

        let sql = `
            SELECT p.product_id, p.name, p.brand, c.name AS category,
                   p.price, p.image_url, p.description, p.is_featured
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (featured === 'true') {
            sql += ' AND p.is_featured = TRUE';
        } else if (featured === 'false') {
            sql += ' AND p.is_featured = FALSE';
        }

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
                sql += featured === 'true'
                    ? ' ORDER BY p.updated_at DESC, p.id ASC'
                    : ' ORDER BY p.id ASC';
        }

        const [rows] = await db.query(sql, params);
        const products = rows.map(formatProductRow);
        res.json({ success: true, count: products.length, products });
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
                    p.price, p.image_url, p.description, p.is_featured
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.product_id = ?`,
            [req.params.productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product: formatProductRow(rows[0]) });
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

        const { name, brand, category_id, price, image_url, description, is_featured = false } = result.value;

        const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (cat.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category_id' });
        }

        const product_id = generateProductId(name);

        await db.query(
            `INSERT INTO products (product_id, name, brand, category_id, price, image_url, description, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, name, brand, category_id, price, image_url, description, Boolean(is_featured)]
        );

        res.status(201).json({ success: true, message: 'Product created', product_id, is_featured: Boolean(is_featured) });
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

        const { name, brand, category_id, price, image_url, description, is_featured } = result.value;

        const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (cat.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category_id' });
        }

        const fields = ['name = ?', 'brand = ?', 'category_id = ?', 'price = ?', 'image_url = ?', 'description = ?'];
        const params = [name, brand, category_id, price, image_url, description];

        if (is_featured !== undefined) {
            fields.push('is_featured = ?');
            params.push(Boolean(is_featured));
        }

        params.push(req.params.productId);

        const [updateResult] = await db.query(
            `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`,
            params
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
 * PATCH /api/products/:productId/featured — Toggle or set featured flag (admin only).
 */
async function toggleProductFeatured(req, res) {
    try {
        const { is_featured } = req.body;
        if (typeof is_featured !== 'boolean') {
            return res.status(400).json({ success: false, error: 'is_featured must be a boolean' });
        }

        const [result] = await db.query(
            'UPDATE products SET is_featured = ? WHERE product_id = ?',
            [is_featured, req.params.productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({
            success: true,
            product_id: req.params.productId,
            is_featured,
            message: is_featured ? 'Product marked as featured' : 'Product removed from featured'
        });
    } catch (err) {
        console.error('PATCH /api/products/:productId/featured error:', err);
        res.status(500).json({ success: false, error: 'Failed to update featured status' });
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    toggleProductFeatured,
    deleteProduct
};
