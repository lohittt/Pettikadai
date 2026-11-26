const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getUsers, getAllOrders, updateOrderStatus } = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/orders
router.get('/orders', getAllOrders);

// PATCH /api/admin/orders/:orderId/status
router.patch('/orders/:orderId/status', updateOrderStatus);

module.exports = router;
