const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Product = require('./../model/Product');
const Cart = require('./../model/Cart');

// @desc    Get all cart For a user
// @route   GET /api/cart
// @access  Private  (User)
exports.getCart = asyncHandler(async (req, res, next) => {

    const userId = req.user.id

    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
        cart = await Cart.create({ user: userId })
    }

    return res.status(200).json({
        status: 'success',
        data: cart,
    });

});

// @desc    Create / Add product to cart
// @route   Post /api/cart
// @access  Private (User)
exports.addToCart = asyncHandler(async (req, res, next) => {

    const { productId, qty } = req.body;

    if (!productId || !qty) {
        return next(new ErrorResponse('Product and Quantity is required.', 400));
    }

    const product = await Product.findById(productId);

    if (!product) {
        next(new ErrorResponse(`Product with ${productId} not found`))
    }

    if (qty > product.quantity) {
        return next(new ErrorResponse(`Quantity of ${product.name} exceeds available stock`, 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        // Create a new cart if the user doesn't have one
        const newCart = await new Cart({
            user: req.user.id,
            items: [{ product: productId, quantity: qty, price: product.price }],
        });

        await newCart.save();

    } else {

        const cartItem = cart.items.find((item) => item.product.toString() === productId)

        if (cartItem) {
            cartItem.quantity += qty
        } else {
            cart.items.push({ product: productId, quantity: qty, price: product.price })
        }

        await cart.save();

    }

    return res.status(201).json({
        status: 'success',
        message: 'Product added to your catt',
        data: cart,
    });

});

// @desc: Decrease the quantity of a product in the cart for the logged-in user.
// @route: PUT /api/cart/:item/decrease
// @access: Private (User)
exports.decreaseQuantity = asyncHandler(async (req, res, next) => {

    const { cartItemId } = req.params

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        next(new ErrorResponse(`Cart not found`, 404))
    }

    const cartItem = cart.items.find((item) => item._id.toString() === cartItemId);

    if (!cartItem) {
        return next(new ErrorResponse(`CartItem with ID ${cartItemId} not found in cart`, 404));
    }

    cartItem.quantity -= 1

    // Ensure the cart item quantity does not go below 1
    if (cartItem.quantity < 1) {
        return next(new ErrorResponse('Cannot decrease quantity below 1', 400));
    }

    await cart.save()

    return res.status(200).json({
        status: 'success',
        message: 'Cart Quantity Decreased',
        data: cart,
    });

});

// @desc: Increase the quantity of a product in the cart for the logged-in user.
// @route: PUT /api/cart/:cartItemId/increase
// @access: Private (User)
exports.increaseQuantity = asyncHandler(async (req, res, next) => {

    const { cartItemId } = req.params

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        next(new ErrorResponse(`Cart not found`, 404))
    }

    const cartItem = cart.items.find((item) => item._id.toString() === cartItemId);

    if (!cartItem) {
        return next(new ErrorResponse(`CartItem with ID ${cartItemId} not found in cart`, 404));
    }

    // Get the product details
    const product = await Product.findById(cartItem.product);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    cartItem.quantity += 1

    if (cartItem.quantity > product.quantity) {
        return next(new ErrorResponse('Cannot add more than available quantity to cart', 400));
    }

    await cart.save()

    return res.status(200).json({
        status: 'success',
        message: 'Cart Quantity Increase',
        data: cart,
    });

});

// @desc: Remove a product from the cart for the logged-in user.
// @route: DELETE /api/cart/:item
// @access: Private (User)
exports.removeFromCart = asyncHandler(async (req, res, next) => {

    const { cartItemId } = req.params

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        next(new ErrorResponse(`Cart not found`, 404))
    }

    const cartItemIndex = cart.items.findIndex((item) => item._id.toString() === cartItemId);

    if (cartItemIndex === -1) {
        return next(new ErrorResponse(`CartItem with ID ${cartItemId} not found in cart`, 404));
    }

    cart.items.splice(cartItemIndex, 1)
    await cart.save({ validateBeforeSave: false });

    return res.status(200).json({
        status: 'success',
        message: 'Cart item removed successfully',
        data: cart,
    });

});

// @desc: Clear the entire cart, removing all items for the logged-in user.
// @route: DELETE /api/cart/clear
// @access: Private (User)
exports.clearCart = asyncHandler(async (req, res, next) => {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        next(new ErrorResponse(`Cart not found`, 404))
    }

    cart.items = [];
    await cart.save({ validateBeforeSave: false });

    return res.status(200).json({
        status: 'success',
        message: 'Cart cleared successfully',
        data: cart,
    });

});