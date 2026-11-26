const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getOrdersBySession,
    getOrderById
} = require('../controllers/ordersController');

// POST /api/orders — Place a new order
router.post('/', placeOrder);

// GET /api/orders/detail/:orderId — Get single order details
router.get('/detail/:orderId', getOrderById);

// GET /api/orders/:sessionId — Get all orders for a session
router.get('/:sessionId', getOrdersBySession);

module.exports = router;
