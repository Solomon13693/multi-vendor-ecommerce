const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStates, createState, updateState, deleteState } = require('../controller/shipping/stateController');
const { createCity, getCities, updateCity, deleteCity } = require('../controller/shipping/CityController');
const router = express.Router();

router
    .route('/')
    .post(protect, authorize('admin'), createCity)
    .get(protect, authorize('admin'), getCities)

router
    .route('/:id')
    .patch(protect, authorize('admin'), updateCity)
    .delete(protect, authorize('admin'), deleteCity)

module.exports = router