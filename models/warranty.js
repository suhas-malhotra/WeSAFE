const { ObjectID } = require('mongodb');
const { Schema, model } = require('mongoose');

const WarrantySchema = new Schema({
  company: String,
  product: String,
  purchase: String,
  expiry: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],

  period: Number,

  description: String,
  owner: ObjectID,
});

module.exports = model('Warranty', WarrantySchema);
