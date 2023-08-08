// routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  clearCart,
} = require('../controller/cartController');

router.get('/', protect, authorize('user'), getCart);

router.post('/', protect, authorize('user'), addToCart);

router.patch('/:cartItemId/decrease', protect, authorize('user'), decreaseQuantity);

router.patch('/:cartItemId/increase', protect, authorize('user'), increaseQuantity);

router.delete('/:cartItemId', protect, authorize('user'), removeFromCart);

router.delete('/', protect, authorize('user'), clearCart);

module.exports = router;
