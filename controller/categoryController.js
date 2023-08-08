const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Category = require('./../model/Category');

// @desc    Get all categories
// @route   GET /api/category
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        data: categories
    });
});

// @desc    Get single category by ID
// @route   GET /api/category/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res, next) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (admin)
exports.createCategory = asyncHandler(async (req, res, next) => {

    const { name } = req.body

    if(await Category.findOne({ name })){
        return next(new ErrorResponse(`Category name ${name} already exist`, 422))
    }

    const category = await Category.create({ name });

    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Update category by ID
// @route   PUT /api/categories/:id
// @access  Private (admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Delete category by ID
// @route   DELETE /api/categories/:id
// @access  Private (admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Category deleted'
    });
});

// @desc    Get single category by Slug
// @route   GET /api/categories/:slug/products
// @access  Public
exports.getCategoryProducts = asyncHandler(async (req, res, next) => {

    const { slug } = req.params

    const category = await Category.findOne({ slug: slug })

    if (!category) {
        return next(new ErrorResponse(`Product with category ${slug} not found`, 404))
    }

    const product = await Product.find({ category: category._id })

    if (!product) {
        return next(new ErrorResponse("No products in this category", 404))
    }

    res.status(200).json({
        success: true,
        product
    });

})
