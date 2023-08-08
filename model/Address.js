// addressModel.js (Address model file)
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    required: true,
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

addressSchema.pre(/^find/, function (next) {
  this.populate({ path: "state", select: "name" }).populate({
    path: "city",
    select: "name baseFee coordinates",
  });
  next();
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
