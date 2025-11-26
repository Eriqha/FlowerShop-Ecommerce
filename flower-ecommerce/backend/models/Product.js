const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],                   // array of image URLs
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: String,
    slug: { type: String, required: true, unique: true },
    addOns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' }],
    stockQuantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
