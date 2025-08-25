// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String, // store in full international format like '919791611675'
    required: true
  }
}, {
  timestamps: true
});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
