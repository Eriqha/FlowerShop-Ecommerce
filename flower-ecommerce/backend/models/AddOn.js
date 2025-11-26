const mongoose = require('mongoose');

const AddOnSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  customizable: { type: Boolean, default: false } 

});

module.exports = mongoose.models.AddOn || mongoose.model('AddOn', AddOnSchema);
