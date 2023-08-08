const cron = require('node-cron');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../model/Product');

const EmailSentMap = new Set();

const checkStockLevel = async () => {
    const products = await Product.find({}).populate({
        path: 'vendor',
        select: 'companyName email phone',
    });

    for (const product of products) {
        const productId = product._id.toString();

        if (product.quantity < 10) {
            if (!EmailSentMap.has(productId)) {
                // console.log(
                //     `Send email to ${product.vendor.email} for Low Stock Alert! ${product.name} is running low on quantity, ${product.quantity} Quantity left`
                // );
                // EmailSentMap.add(productId);
            }
        } else {
            // If the product quantity becomes greater than 10, mark it as restocked
            if (EmailSentMap.has(productId)) {
                EmailSentMap.delete(productId);
            }
        }
    }
};

const scheduleStockCheck = () => {
    // Schedule cron job to run every second (adjust frequency as needed)
    cron.schedule('* * * * * *', () => {
        checkStockLevel();
    });
};

module.exports = scheduleStockCheck;
