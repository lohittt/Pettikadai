const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getWishlist, toggleWishlist, removeFromWishlist } = require('../controllers/wishlistController');

// Wishlist is strictly for customer ('user') accounts
router.use(requireAuth, requireRole('user'));

router.get('/', getWishlist);
router.post('/', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
