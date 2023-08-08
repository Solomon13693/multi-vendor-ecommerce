const asyncHandler = require('../middleware/asyncHandler');
const Wallet = require('../model/Wallet')
const User = require('../model/User')

exports.createWallet = asyncHandler(async (userId) => {

    const userWallet = await Wallet.findOne({ user: userId });

    if (!userWallet) {
        await Wallet.create({
            balance: 0,
            user: userId
        });
    }

});

exports.creditWallet = asyncHandler(async (amount, userId) => {

    amount = parseFloat(amount);

    const user = await User.findById(userId)

    const wallet = await Wallet.findOne({ user: user._id });

    wallet.balance += amount;
    await wallet.save();

});

exports.debitWallet = asyncHandler(async (amount, userId) => {

    amount = parseFloat(amount);

    const user = await User.findById(userId)

    const wallet = await Wallet.findById(user.walletId);

    wallet.balance -= amount;
    await wallet.save();

});


