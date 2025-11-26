const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
} = require('../controllers/productController');

const protect = require('../middleware/authMiddleware');

// GET all products
router.get('/', getProducts);

// GET product by id
router.get('/:id', getProductById);

// CREATE product
router.post('/', protect, createProduct);

// UPDATE product (PATCH or PUT)
router.patch('/:id', updateProduct);
router.put('/:id', updateProduct);

module.exports = router;
