const User = require('../model/User')
const Vendor = require('../model/Vendor')
const Product = require('../model/Product')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const cloudinary = require('../config/cloudinary')

// @desc    Login user
// @route   POST /api/v1/admin/auth/login
// @access  Public
exports.Login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please enter your email address and password', 422));
    }

    const user = await User.findOne({ email: email }).select('+password +verified');

    if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    if (user.role.includes('admin')) {
        const jwt = await user.JwtToken();
        return res.status(200).json({
            status: 'success',
            token: jwt
        });
    } else {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }
});

