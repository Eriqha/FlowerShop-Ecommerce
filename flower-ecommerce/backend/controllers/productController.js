const Product = require('../models/Product');
const Category = require('../models/Category');

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
