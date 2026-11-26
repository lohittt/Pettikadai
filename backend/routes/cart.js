const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../controllers/cartController');

// Cart is strictly for customer ('user') accounts; admins cannot buy/checkout
router.use(requireAuth, requireRole('user'));

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/', updateCartQuantity);
router.delete('/item/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
