const Cart = require('../model/Cart');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Address = require('../model/Address');
const { calculateDistance } = require('./shipping/calculateShipping');

exports.getCheckoutSummary = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    // Get the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price vendor images',
    });

    const userAddress = await Address.findOne({ user: userId, isDefault: true });

    if (!cart) {
        return next(new ErrorResponse('Cart not found', 404));
    }

    const cartItems = cart.items;
    let totalShippingPrice = 0;
    let totalPrice = 0;

    // Create an array of promises to calculate shipping cost for each item
    const shippingCostPromises = cartItems.map(async (item) => {

        const product = item.product;
        const vendor = product.vendor._id.toString();
        const city = userAddress.city._id.toString();

        const shippingCost = await calculateDistance(city, vendor);
        const itemShipping = shippingCost * item.quantity;
        const itemTotal = product.price * item.quantity + itemShipping;

        totalShippingPrice += itemShipping;
        totalPrice += itemTotal;

        // Return the updated item with shipping cost
        return {
            ...item._doc,
            shippingCost: itemShipping,
            totalPriceWithShipping: itemTotal,
        };
    });

    // Wait for all the shipping cost calculations to complete
    const updatedCartItems = await Promise.all(shippingCostPromises);

    return res.status(200).json({
        status: 'success',
        data: {
            ...cart._doc,
            items: updatedCartItems, // Return the updated cartItems array
            totalShippingPrice,
            totalPrice,
        },
        userAddress,
    });

});