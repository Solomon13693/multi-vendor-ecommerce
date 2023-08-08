const State = require('../model/State');
const City = require('../model/City');
const Address = require('../model/Address');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// GET /api/v1/address
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const addresses = await Address.find({ user: userId })

  return res.status(200).json({
    status: 'success',
    data: addresses,
  });

});

// POST /api/v1/address
exports.createAddress = asyncHandler(async (req, res, next) => {
  const { state, city, address, isDefault, phone, name } = req.body;
  const userId = req.user.id;

  // Check if the user already has 5 addresses
  const userAddressesCount = await Address.countDocuments({ user: userId });
  if (userAddressesCount >= 5) {
    return next(new ErrorResponse('You can only add up to 5 addresses'));
  }

  // Check if the user already has a default address
  const userDefaultAddress = await Address.findOne({ user: userId, isDefault: true });
  if (isDefault && userDefaultAddress) {
    return next(new ErrorResponse('You can only set one address as the default address'));
  }

  // Check if the provided state and city exist
  const existingState = await State.findById(state);
  const existingCity = await City.findById(city);

  if (!existingState || !existingCity) {
    return next(new ErrorResponse('Invalid state or city'));
  }

  // Create the address
  const newAddress = await Address.create({
    user: userId,
    state,
    city,
    address,
    phone,
    name,
    isDefault,
  });

  return res.status(201).json({
    status: 'success',
    data: newAddress,
  });
});

// PATCH /api/v1/address/:id/default
exports.setDefaultAddress = asyncHandler(async (req, res, next) => {

  const addressId = req.params.id;
  const userId = req.user.id;

  if (!await Address.findById(addressId)) {
    return next(new ErrorResponse(`Address not found`, 404))
  }

  // Find the current default address
  const currentDefault = await Address.findOne({ user: userId, isDefault: true });

  // Set the current default address to false
  if (currentDefault) {
    currentDefault.isDefault = false;
    await currentDefault.save();
  }

  // Set the selected address to default
  const selectedAddress = await Address.findById(addressId);
  if (selectedAddress) {
    selectedAddress.isDefault = true;
    await selectedAddress.save();
  }

  return res.status(200).json({
    status: 'success',
    data: selectedAddress,
  });

});

// DELETE
exports.deleteAddress = asyncHandler(async (req, res, next) => {

  const address = await Address.findById(req.params.id)

  if (!address) {
    return next(new ErrorResponse(`Address not found`, 404))
  }

  await Address.deleteOne({ _id: address._id });

  return res.status(200).json({
    status: 'success',
    message: 'Address deleted',
  });

})