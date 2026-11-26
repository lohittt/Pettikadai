const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

// GET /api/cart/:sessionId — Get all cart items for a session
router.get('/:sessionId', getCart);

// POST /api/cart — Add item to cart
router.post('/', addToCart);

// PATCH /api/cart — Update item quantity
router.patch('/', updateCartQuantity);

// DELETE /api/cart/:sessionId/:productId — Remove item from cart
router.delete('/:sessionId/:productId', removeFromCart);

// DELETE /api/cart/:sessionId — Clear entire cart
router.delete('/:sessionId', clearCart);

module.exports = router;
