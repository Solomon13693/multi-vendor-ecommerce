const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    baseFee: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Static method to fetch all cities belonging to a specific state
citySchema.statics.getCitiesByState = async function (stateId) {
  const cities = await this.find({ state: stateId });
  return cities;
};

const City = mongoose.model('City', citySchema);

module.exports = City;
