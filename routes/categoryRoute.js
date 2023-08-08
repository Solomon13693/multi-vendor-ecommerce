const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createCategory, updateCategory, getCategories, deleteCategory, getCategoryById, getCategoryProducts } = require('../controller/categoryController')
const router = express.Router();

router
    .route('/')
    .post(protect, authorize('admin'), createCategory)
    .get(getCategories)

router
    .route('/:id')
    .patch(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory)
    .get(getCategoryById)

router
    .route('/:slug/products')
    .get(getCategoryProducts)

module.exports = router;
