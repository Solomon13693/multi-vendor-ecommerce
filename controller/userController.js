const User = require('../model/User')
const Wallet = require('../model/Wallet')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')

// @desc    Get User data
// @route   GET /api/user/profile
// @access  Private
exports.getUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 400));
    }

    return res.status(200).json({
        status: 'success',
        user
    })

});

// @desc    Get User Wallet
// @route   GET /api/user/wallet
// @access  Private
exports.getUserWallet = asyncHandler(async (req, res) => {

    const wallet = await Wallet.findOne({ user: req.user.id }).populate({ path: 'user', select: 'name' })

    return res.status(200).json({
        status: 'success',
        wallet
    })

});


// @desc    Get User data
// @route   GET /api/update/profile'
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {

    let user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 404));
    }

    const updateField = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
    }

    user = await User.findByIdAndUpdate(req.user.id, updateField, {
        new: true,
        runValidators: true
    })

    return res.status(200).json({
        status: 'success',
        user
    })


})

// @desc    Get User data
// @route   GET /api/user/update/password
// @access  Private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {

    const { newPassword, currentPassword } = req.body

    if (!newPassword || !currentPassword) {
        return next(new ErrorResponse('Password and current password are required'))
    }

    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.checkPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Current Password is incorrect', 400));
    }

    user.password = newPassword
    await user.save()

    const token = generateToken(user.id)

    return res.status(200).json({
        status: 'success',
        message: 'Password has been updated successfully',
        token
    })

})