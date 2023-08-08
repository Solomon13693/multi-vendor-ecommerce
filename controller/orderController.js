const asyncHandler = require('../middleware/asyncHandler');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const ErrorResponse = require('../utils/errorResponse')


exports.applyVoucher = asyncHandler(async (req, res, next) => {

    const { prodcutId } = req.params
    const { code, } = req.params

})

// POST /api/v1/orders
exports.placeOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price vendor',
    });

    const userAddress = await Address.findOne({ user: userId, isDefault: true });

    if (!cart) {
        return next(new ErrorResponse('Cart not found', 404));
    }

    const cartItems = cart.items;
    let totalShippingPrice = 0;
    let totalPrice = 0;

    for (const item of cartItems) {
        const product = item.product;
        const vendor = product.vendor._id.toString();
        const city = userAddress.city._id.toString();

        const shippingCost = await calculateDistance(city, vendor);
        const itemShipping = shippingCost * item.quantity;
        const itemTotal = product.price * item.quantity + itemShipping;

        totalShippingPrice += itemShipping;
        totalPrice += itemTotal;

        item.shippingCost = itemShipping;
        item.totalPriceWithShipping = itemTotal;
    }

    // Calculate the final order amount (including shipping)
    const orderAmount = totalPrice + totalShippingPrice;

    // Process the payment (You need to implement the payment processing logic)

    // Create the order
    const order = await Order.create({
        user: userId,
        items: cart.items,
        paymentMethod: // Payment method selected by the user,
            paymentStatus, // Payment status based on the payment processing result,
        paymentAmount: orderAmount,
        billingAddress: // User's billing address,
            shippingAddress // User's shipping address,
        // Other order details
    });

    // Clear the user's cart after placing the order
    await cart.remove();

    return res.status(200).json({
        status: 'success',
        data: order,
    });
});
