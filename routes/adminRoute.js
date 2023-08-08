const express = require('express');
const { Login } = require('../controller/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/multer');
const { getTransactions, getTransaction } = require('../controller/TransactionController');
const router = express.Router();

router.route('/auth/login')
  .post(Login);

  router.route('/transactions').get(protect, authorize('admin'), getTransactions);
  router.route('/transaction/:id').get(protect, authorize('admin'), getTransaction);

module.exports = router;
