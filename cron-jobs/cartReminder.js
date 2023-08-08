const cron = require('node-cron');
const Cart = require('./../model/Cart');
const User = require('./../model/User');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../model/Product');

const cartReminder = asyncHandler(async () => {
    // Create maps to store the last email sent timestamp for each cart item ID
    const fiveDaysEmailSentMap = new Map();
    const thirtyDaysEmailSentMap = new Map();

    const task = cron.schedule('0 0 * * *', async () => {
        // Get all carts
        const carts = await Cart.find({});

        // Calculate the date 5 days ago and 30 days ago
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        // Loop through all carts
        for (const cart of carts) {
            // Check if the cart is 5 days old and has items
            for (const cartItem of cart.items) {

                const cartItemId = cartItem._id.toString();
                const productId = cartItem.product.toString();

                // find Products
                const product = await Product.findById(productId)

                // Check if the item was created exactly 5 days ago
                const itemCreatedAt = new Date(cartItem.createdAt);

                const isFiveDaysReminder = itemCreatedAt.getTime() <= fiveDaysAgo.getTime() && !fiveDaysEmailSentMap.has(cartItemId);

                // Check if the item was created exactly 30 days ago
                const isThirtyDaysReminder = itemCreatedAt.getTime() <= thirtyDaysAgo.getTime() && !thirtyDaysEmailSentMap.has(cartItemId);

                // MAIL DATA
                const data = {
                    product: product.name,
                    qty: cartItem.quantity,
                    price: product.price
                }

                if (isFiveDaysReminder || isThirtyDaysReminder) {
                    const user = await User.findById(cart.user);

                    if (isFiveDaysReminder) {
                        console.log(`Send email to ${user.email} for ${JSON.stringify(data)} (5 days reminder)`);
                        fiveDaysEmailSentMap.set(cartItemId, Date.now());
                    }

                    if (isThirtyDaysReminder) {
                        console.log(`Send email to ${user.email} for ${JSON.stringify(data)} (30 days reminder)`);
                        thirtyDaysEmailSentMap.set(cartItemId, Date.now());
                    }
                }
            }
        }
    });

    // Handle errors during cron job execution
    task.on('error', (error) => {
        console.error('Error sending cart reminders:', error);
    });

    // Start the cron job
    task.start();
});

module.exports = cartReminder;
