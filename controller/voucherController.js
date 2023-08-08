const asyncHandler = require('../middleware/asyncHandler');
const Voucher = require('../model/Voucher');
const Vendor = require('../model/Vendor');
const ErrorResponse = require('../utils/errorResponse')

// Create a new discount code
exports.createDiscountCode = asyncHandler(async (req, res, next) => {

    const { code, percentage, expires } = req.body;

    const vendor = await Vendor.findOne({ user: req.user.id })

    if(await Voucher.findOne({ code })){
        return next(new ErrorResponse(`Voucher code ${code} already exist`, 500))
    }

    const discountCode = await Voucher.create({
        code,
        percentage,
        expires,
        vendor: vendor._id
    });

    res.status(201).json({
        success: true,
        data: discountCode,
    });

});

// Get all discount codes
exports.getAllDiscountCodes = asyncHandler(async (req, res, next) => {

    const discountCodes = await Voucher.find().populate({ path: 'vendor', select: 'companyName email phone' });
    res.status(200).json({
        success: true,
        data: discountCodes,
    });

});

// Get a single discount code by ID
exports.getDiscountCode = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const discountCode = await Voucher.findById(id);

    if (!discountCode) {
        return next(new ErrorResponse('Discount code not found', 404));
    }

    res.status(200).json({
        success: true,
        data: discountCode,
    });

});

// Update a discount code
exports.updateDiscountCode = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const { code, percentage, expires } = req.body;

    const discountCode = await Voucher.findByIdAndUpdate(
        id,
        { code, percentage, expires },
        { new: true }
    );

    if (!discountCode) {
        return next(new ErrorResponse('Discount code not found', 404));
    }

    res.status(200).json({
        success: true,
        data: discountCode,
    });
});

// Delete a discount code
exports.deleteDiscountCode = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const discountCode = await Voucher.findByIdAndDelete(id);

    if (!discountCode) {
        return next(new ErrorResponse('Discount code not found', 404));
    }

    res.status(200).json({
        success: true,
        data: discountCode,
    });

});

exports.getVendorDiscountCodes = asyncHandler(async (req, res, next) => {

    const vendor = await Vendor.findOne({ user: req.user.id })
    
    const discountCode = await Voucher.find({ vendor: vendor._id });

    if (!discountCode) {
        return next(new ErrorResponse('Discount code not found', 404));
    }

    res.status(200).json({
        success: true,
        data: discountCode,
    });


})