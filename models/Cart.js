const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0
  }
});

module.exports = Cart = mongoose.model('cart', CartSchema);
