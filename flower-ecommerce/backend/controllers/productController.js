const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const { categories: categorySlug, sort, inStock } = req.query;
    let filter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) filter.category = category._id;
      else filter.category = null;
    }

    if (inStock) filter.stockQuantity = { $gt: 0 };

    let query = Product.find(filter).populate('category').populate('addOns');

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'alpha_asc') query = query.sort({ name: 1 });
    else if (sort === 'alpha_desc') query = query.sort({ name: -1 });

    const products = await query;
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
                                 .populate('category')
                                 .populate('addOns');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    // ensure slug is unique (basic)
    if (!req.body.slug && req.body.name) req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id)
                                          .populate('category')
                                          .populate('addOns');
    res.status(201).json(populatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('category').populate('addOns'); // populate after update

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SOFT DELETE product (mark inactive)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product marked inactive' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload single image and attach to product.images
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const product = await Product.findById(req.params.id);
    if (!product) {
      // remove uploaded file if product not found
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(404).json({ message: 'Product not found' });
    }
    // store relative path for frontend to load
    const rel = `/uploads/products/${req.file.filename}`;
    product.images = product.images || [];
    product.images.push(rel);
    await product.save();
    const populated = await Product.findById(product._id).populate('category').populate('addOns');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
