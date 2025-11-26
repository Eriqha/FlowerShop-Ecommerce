const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware'); // your JWT auth middleware

router.get('/', getCategories);
router.post('/', protect, admin, createCategory); // only admin can create

module.exports = router;
