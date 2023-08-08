const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Product = require('./../model/Product');
const Review = require('./../model/Review');

// @desc    Get all Reviews For a product
// @route   GET /api/review/:productId
// @access  Public
exports.getReviewsByProduct = asyncHandler(async (req, res, next) => {

    const { productId } = req.params

    const review = await Review.find({ product: productId }).populate({ path: 'product user', select: 'name' })

    if(!review){
        return next(new ErrorResponse(`No review for this product`, 404))
    }

    return res.status(200).json({
        status: 'success',
        data: review
    })

});

// @desc    Create a new review
// @route   Post /api/review
// @access  Private (User)
exports.createReview = asyncHandler(async (req, res, next) => {

    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorResponse(`Product with Id of ${productId} not found`, 404));
    }

    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ user: req.user.id, product: productId });
    if (existingReview) {
        return next(new ErrorResponse('You have already reviewed this product', 400));
    }

    const review = await Review.create({
        user: req.user.id,
        product: product._id,
        rating,
        comment,
    });

    return res.status(201).json({
        status: 'success',
        data: review,
    });
});


// @desc    Delete a review
// @route   Delete /api/review/:id
// @access  Private (User)
exports.deleteReview = asyncHandler(async (req, res, next) => {

    const { id } = req.params

    await Review.findByIdAndDelete(id)

    return res.status(200).json({
        status: 'success',
        message: `Review with Id of ${id} has been deleted`
    })

});

// @desc     Get all reviews by a user
// @route   Patch /api/review/user
// @access  Private (User)
exports.getReviewsByUser = asyncHandler(async (req, res, next) => {

    const review = await Review.find({ user: req.user.id }).populate({ path: 'product', select: 'name price' })

    if(!review){
        return next(new ErrorResponse(`No review for this user`, 404))
    }

    return res.status(200).json({
        status: 'success',
        data: review
    })

});
