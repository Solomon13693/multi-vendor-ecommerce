const axios = require('axios');
const asyncHandler = require('../../middleware/asyncHandler');
const { creditTransaction } = require('../TransactionController');
const User = require('./../../model/User');
const { creditWallet } = require('../walletController');
const Transaction = require('../../model/Transaction');

// @desc    Login user
// @route   POST /api/v1/admin/auth/login
// @access  provate
exports.initializePayment = asyncHandler(async (req, res, next) => {

    const user = req.user
    const amount = req.body.amount
    const email = user.email

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
        amount: amount * 100, //convert to kobo
        email,
        channels: ["card", "bank", "ussd", "qr", "bank_transfer"]
    },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY} `,
                'Content-Type': 'application/json'
            }
        })

    const reference = response.data.data.reference
    const paymentGateway = "Paystack"
    const type = "credit"
    const description = "Wallet Funding"
    const status = "pending"

    await creditTransaction(user, type, amount, status, reference, paymentGateway, description, details = undefined)

    return res.status(200).json({
        status: 'success',
        data: response.data,
    });

})

exports.webhook = asyncHandler(async (req, res, next) => {

    const data = req.body.data;

    const paymentId = data.reference

    const verifyPaymentWithReqRes = verifyPayment.bind(null, req, res)

    await verifyPaymentWithReqRes(paymentId);

})

const verifyPayment = asyncHandler(async (req, res, paymentId) => {

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${paymentId}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY} `,
            'Content-Type': 'application/json'
        }
    })

    let { amount, status, reference, customer } = response.data.data

    amount = amount / 100

    const user = await User.findOne({ email: customer.email })

    const details = response.data.data
    const paymentGateway = "Paystack"
    const type = "credit"
    const description = "Wallet Funding"

    const transaction = await Transaction.findOne({ reference: reference })

    if (status === 'success') {

        if (transaction?.status === 'success') {
            res.status(200).json({
                success: true,
                message: `Your payment of ${amount} has been received, but your wallet has already been credited.`
            });
        } else {
            await creditWallet(amount, user._id)
            await creditTransaction(user, type, amount, status, reference, paymentGateway, description, details)
            res.status(200).json({
                success: true,
                message: `'Your payment of ${amount} has been received and your wallet has been credited with ' . ${amount}`
            });
        }

    } else if (status === 'failed' || status === 'cancelled' || status === 'abandoned' || status === 'pending') {
        await creditTransaction(user, type, amount, status, reference, paymentGateway, description, details);
        res.status(200).json({
            success: true,
            message: `Your payment of ${amount} ${status}.`
        });
    }

})