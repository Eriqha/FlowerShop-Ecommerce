const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],                   // array of image URLs
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: String,
    slug: { type: String, required: true, unique: true },
    addOns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' }]
});

module.exports = mongoose.model('Products', ProductSchema);
