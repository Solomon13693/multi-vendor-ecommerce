const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStates, createState, updateState, deleteState, getCitiesByState } = require('../controller/shipping/stateController');
const router = express.Router();

router
    .route('/')
    .post(protect, authorize('admin'), createState)
    .get(getStates)

router
    .route('/:id')
    .patch(protect, authorize('admin'), updateState)
    .delete(protect, authorize('admin'), deleteState)

router
    .route('/:stateId/city')
    .get(getCitiesByState)

module.exports = router