const mongoose = require('mongoose');

const AddOnSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  customizable: { type: Boolean, default: false } 

});

module.exports = mongoose.model('AddOn', AddOnSchema);
