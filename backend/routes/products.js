const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productsController');

// GET /api/products — List all products (with optional filters)
// Query params: ?category=Electronics&search=nike&sort=low-high
router.get('/', getProducts);

// GET /api/products/:productId — Get single product details
router.get('/:productId', getProductById);

module.exports = router;
