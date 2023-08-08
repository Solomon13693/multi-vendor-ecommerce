const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const {
    createDiscountCode,
    getAllDiscountCodes,
    getDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    getVendorDiscountCodes,
} = require('../controller/voucherController');

router.post('/code', protect, authorize('vendor'), createDiscountCode);
router.get('/codes',  protect, authorize('vendor'), getAllDiscountCodes);
router.get('/codes/vendor',  protect, authorize('vendor'), getVendorDiscountCodes);
router.patch('/code/:id', protect, authorize('vendor'), updateDiscountCode);
router.delete('/code/:id', protect, authorize('vendor', 'admin'), deleteDiscountCode);

module.exports = router;
