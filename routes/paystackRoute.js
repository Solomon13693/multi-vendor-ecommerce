const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { initializePayment, webhook } = require('../controller/paymentGateWay/paystack');
const router = express.Router();

router
    .route('/initialize')
    .post(protect, authorize('user'), initializePayment)

router
    .route('/webhook')
    .post(webhook)

// router
//     .route('/:paymentId')
//     .get(verifyPayment)


module.exports = router;
