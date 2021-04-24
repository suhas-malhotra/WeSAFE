const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'A name is Required'],
  },
  product: {
    type: String,
    required: [true, 'A name is Required'],
  },
  period: [
    {
      year: Number,
    },
    {
      month: Number,
    },
    {
      days: Number,
    },
  ],
  description: String,
});

const Warranty = mongoose.model(
  'Warranty',
  warrantySchema,
  'warranty_card_details'
);

module.exports = Warranty;
