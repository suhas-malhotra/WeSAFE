const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WarrantySchema = new Schema({
  company: String,
  product: String,
  purchase: Date,
  period: Number,
  description: String,
});

module.exports = mongoose.model('Warranty', WarrantySchema);
