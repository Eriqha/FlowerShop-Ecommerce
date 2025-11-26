const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders } = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/:userId', protect, getUserOrders);

module.exports = router;
