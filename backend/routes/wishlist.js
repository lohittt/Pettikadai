const express = require('express');
const router = express.Router();
const {
    getWishlist,
    toggleWishlist,
    removeFromWishlist
} = require('../controllers/wishlistController');

// GET /api/wishlist/:sessionId — Get wishlist items
router.get('/:sessionId', getWishlist);

// POST /api/wishlist — Toggle product in wishlist
router.post('/', toggleWishlist);

// DELETE /api/wishlist/:sessionId/:productId — Remove specific item
router.delete('/:sessionId/:productId', removeFromWishlist);

module.exports = router;
