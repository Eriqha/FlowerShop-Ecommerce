const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, bannerImage } = req.body;

    const category = new Category({
      name,
      slug,
      description,
      bannerImage
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getCategories, createCategory };
