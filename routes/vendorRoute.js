const express = require('express');
const { Register, Login, updateVendor, applyDiscount, getProduct, getProducts, getVendor, removeDiscount } = require('../controller/vendorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/multer');
const router = express.Router();

router.route('/auth/register')
  .post(protect, upload.single('logo'), Register);

router.route('/auth/login')
  .post(Login);

router.route('/update/profile')
  .patch(protect, authorize('vendor', 'admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateVendor);

// === PRODUCTS === //
router
  .route('/products')
  .get(protect, authorize('vendor', 'admin'), getProducts);

router
  .route('/product/:id')
  .get(protect, authorize('vendor', 'admin'), getProduct);

router
  .route('/product/:id/discount')
  .post(protect, authorize('vendor', 'admin'), applyDiscount);

router
  .route('/product/:id/discount/remove')
  .post(protect, authorize('vendor', 'admin'), removeDiscount);

  router.route('/:code').get(getVendor);

module.exports = router;
