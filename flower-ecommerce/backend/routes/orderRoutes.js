const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, uploadReceipt, markOrderCompleted, getReceiptHtml } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer setup for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads', 'receipts')),
	filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// Create a new order (user)
router.post('/', protect, createOrder);
// Get orders by user ID (customer dashboard)
router.get('/:userId', protect, getUserOrders);

// Admin endpoints
router.get('/', protect, admin, getAllOrders);
router.get('/order/:orderId', protect, getOrderById);
router.get('/:orderId/receiptHtml', protect, getReceiptHtml);
router.put('/:orderId/status', protect, admin, updateOrderStatus);
router.post('/:orderId/uploadReceipt', protect, admin, upload.single('receipt'), uploadReceipt);
router.put('/:orderId/complete', protect, admin, markOrderCompleted);

module.exports = router;
