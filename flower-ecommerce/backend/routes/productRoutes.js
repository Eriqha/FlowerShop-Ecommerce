const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const { deleteProduct, uploadProductImage } = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');

// GET all products
router.get('/', getProducts);

// GET product by id
router.get('/:id', getProductById);

// CREATE product
router.post('/', protect, admin, createProduct);

// UPDATE product (PATCH or PUT)
router.patch('/:id', updateProduct);
router.put('/:id', updateProduct);

// DELETE (soft)
router.delete('/:id', protect, admin, deleteProduct);

// image upload for product
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads', 'products')),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });
router.post('/:id/images', protect, admin, upload.single('image'), uploadProductImage);

module.exports = router;
