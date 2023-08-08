const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can have only one cart
  },
  items: [cartItemSchema], // An array of cart items, each referencing a product and its quantity
  totalQuantity: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

// Calculate the total quantity and total price of items in the cart before saving
cartSchema.pre('save', function (next) {
  this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
