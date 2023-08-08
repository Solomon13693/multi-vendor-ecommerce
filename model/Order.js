const mongoose = require('mongoose');

const productItem = new mongoose.Schema({
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
  shippingCost: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [productItem],
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'payment-on-delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    deliveryDate: {
      type: Date,
    },
    billingAddress: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
    }
  },
  { timestamps: true }
);

// Calculate total price of the order
orderSchema.methods.calculateTotalPrice = function () {
  return this.products.reduce((total, product) => total + product.price * product.quantity, 0);
};

// Static method to get all orders placed by a specific user
orderSchema.statics.getOrdersByUser = function (userId) {
  return this.find({ user: userId });
};

// Static method to update the status of a specific order
orderSchema.statics.updateOrderStatus = async function (orderId, newStatus) {
  return this.findByIdAndUpdate(orderId, { status: newStatus });
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
