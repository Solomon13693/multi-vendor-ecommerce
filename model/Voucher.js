const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
