// models/ProductMeta.js
const mongoose = require('mongoose');

const productMetaSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true,
  },
  manufactureDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  deliveryTime: {
    type: String, // e.g., "10:30 AM"
    required: true,
  },
}, {
  timestamps: true,
});

const ProductMeta = mongoose.model("ProductMeta", productMetaSchema);
module.exports = ProductMeta;