const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { placeOrder, getOrders, getOrderById } = require('../controllers/ordersController');

// Orders endpoints are strictly for customer ('user') accounts (admins use /api/admin/orders)
router.use(requireAuth, requireRole('user'));

router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/detail/:orderId', getOrderById);

module.exports = router;
