const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, 
  description: String,
  bannerImage: String,
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
