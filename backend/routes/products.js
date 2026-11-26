const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');

// Public routes
router.get('/', getProducts);
router.get('/:productId', getProductById);

// Admin-only routes
router.post('/', requireAuth, requireRole('admin'), createProduct);
router.put('/:productId', requireAuth, requireRole('admin'), updateProduct);
router.delete('/:productId', requireAuth, requireRole('admin'), deleteProduct);

module.exports = router;
