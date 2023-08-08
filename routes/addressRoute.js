const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAddresses, deleteAddress, setDefaultAddress, createAddress } = require('../controller/addressController');
const router = express.Router();

router
    .route('/')
    .post(protect, authorize('user'), createAddress)
    .get(protect, authorize('user'), getAddresses)

router
    .route('/:id')
    .delete(protect, authorize('user'), deleteAddress)

router
    .route('/:id/default')
    .patch(protect, authorize('user'), setDefaultAddress)

module.exports = router