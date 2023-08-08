const State = require('../../model/State');
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/asyncHandler');
const City = require('../../model/City');

// @desc    Get all states
// @route   GET /api/v1/states
// @access  Public
exports.getStates = asyncHandler(async (req, res, next) => {
  const states = await State.find();
  res.status(200).json({
    success: true,
    data: states
  });
});

// @desc    Create a new state
// @route   POST /api/v1/states
// @access  Private (Admin only)
exports.createState = asyncHandler(async (req, res, next) => {

  if (await State.findOne({ name: req.body.name })) {
    return next(new ErrorResponse('Name already exists', 409));
  }

  const state = await State.create(req.body);


  res.status(201).json({
    success: true,
    data: state
  });
});

// @desc    Update a state by ID
// @route   PUT /api/v1/states/:id
// @access  Private (Admin only)
exports.updateState = asyncHandler(async (req, res, next) => {
  const state = await State.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!state) {
    return next(new ErrorResponse(`State not found with ID ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: state
  });
});

// @desc    Delete a state by ID
// @route   DELETE /api/v1/states/:id
// @access  Private (Admin only)
exports.deleteState = asyncHandler(async (req, res, next) => {
  const state = await State.findByIdAndDelete(req.params.id);
  if (!state) {
    return next(new ErrorResponse(`State not found with ID ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

// GET /api/v1/state/stateId/cities
exports.getCitiesByState = asyncHandler(async (req, res, next) => {

  const stateId = req.params.stateId;

  const cities = await City.getCitiesByState(stateId);

  return res.status(200).json({
    status: 'success',
    data: cities,
  });

});