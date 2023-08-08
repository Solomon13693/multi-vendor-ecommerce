const jwt = require('jsonwebtoken')
const User = require('../model/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('./asyncHandler')

exports.protect = asyncHandler(async (req, res, next) => {

    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('You are not logged in, Please Login to access this route', 401))
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)

    if (!user) {
        return next(new ErrorResponse('User Belonging to this token does not exist', 404))
    }

    req.user = user

    next()

})

exports.authorize = (...roles) => {
    return (req, res, next) => {
        const userRoles = req.user.role;
        // Check if any of the user's roles matches the provided roles
        const isAuthorized = userRoles.some((role) => roles.includes(role));
        if (!isAuthorized) {
            return next(new ErrorResponse(`Unauthorized access`, 401));
        }
        next();
    };
};
