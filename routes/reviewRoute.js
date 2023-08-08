const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createReview, deleteReview, getReviewsByProduct, getReviewsByUser } = require('../controller/reviewController');
const router = express.Router();

router
    .route('/:productId')
    .post(protect, authorize('user'), createReview)
    .get(getReviewsByProduct)

router
    .route('/:id')
    .delete(protect, authorize('user'), deleteReview)

router
    .route('/user/reviews')
    .get(protect, getReviewsByUser)


module.exports = router;
