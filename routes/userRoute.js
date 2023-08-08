const express = require('express');
const { getUser, updateUserPassword, updateUser, getUserWallet } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const { getUserTransaction, getTransaction } = require('../controller/TransactionController');
const router = express.Router();

router.route('/profile').get(protect, getUser);
router.route('/wallet').get(protect, getUserWallet);
router.route('/update/profile').patch(protect, updateUser);
router.route('/update/password').patch(protect, updateUserPassword);
router.route('/transactions').get(protect, getUserTransaction);
router.route('/transaction/:id').get(protect, getTransaction);

module.exports = router;
