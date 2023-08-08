const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createProduct, uploadProductImage, updateProductImage, updateProduct, deleteProduct, getProductBySlug, getProducts, deleteProductImage, getProductsByVendor } = require('../controller/productController');
const router = express.Router();
const upload = require('../utils/multer');
const advanceResult = require('../middleware/advanceResult');
const Product = require('../model/Product');

router
    .route('/')
    .post(protect, authorize('vendor', 'admin'), upload.array('images', 5), createProduct)
    .get(getProducts)

router
    .route('/vendor')
    .get(getProductsByVendor)

router
    .route('/:slug')
    .get(getProductBySlug)

router
    .route('/:id')
    .patch(protect, authorize('vendor', 'admin'), updateProduct)
    .delete(protect, authorize('vendor', 'admin'), deleteProduct);

router
    .route('/:productId/image/:imagePublicId')
    .delete(protect, authorize('vendor', 'admin'), deleteProductImage)
    .patch(protect, authorize('vendor', 'admin'), updateProductImage);

router
    .route('/:productId/image')
    .post(protect, authorize('vendor', 'admin'), uploadProductImage);

module.exports = router;
