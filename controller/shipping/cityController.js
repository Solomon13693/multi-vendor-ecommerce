const City = require('../../model/City');
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/asyncHandler')

// @desc    Get all cities
// @route   GET /api/v1/cities
// @access  Public
exports.getCities = asyncHandler(async (req, res, next) => {

    const cities = await City.find();

    res.status(200).json({
        success: true,
        data: cities
    });
});

// @desc    Create a new city
// @route   POST /api/v1/cities
// @access  Private (Admin only)
exports.createCity = asyncHandler(async (req, res, next) => {

    if (await City.findOne({ name: req.body.name })) {
        return next(new ErrorResponse('Name already exists', 409));
    }

    const city = await City.create(req.body);

    res.status(201).json({
        success: true,
        data: city
    });
});

// @desc    Update a city by ID
// @route   PUT /api/v1/cities/:id
// @access  Private (Admin only)
exports.updateCity = asyncHandler(async (req, res, next) => {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!city) {
        return next(new ErrorResponse(`City not found with ID ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: city
    });
});

// @desc    Delete a city by ID
// @route   DELETE /api/v1/cities/:id
// @access  Private (Admin only)
exports.deleteCity = asyncHandler(async (req, res, next) => {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
        return next(new ErrorResponse(`City not found with ID ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: {}
    });

});
