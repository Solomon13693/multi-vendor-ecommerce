const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number
  },
  quantity: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
    }
  ],
  specifications: {
    color: String,
    size: String,
    weight: Number,
  },
  shipping: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  views: {
    type: Number,
    default: 0
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}, { timestamps: true },);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.name && this._update.name !== this._conditions.name) {
    this._update.slug = slugify(this._update.name, { lower: true });
  }
  next();
});

// POPULATE
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name' }).populate({ path: 'vendor', select: 'companyName phone code email' })
  next()
})

productSchema.virtual('reviews', {
  ref: 'Review', // Model to use for populating the virtual property
  localField: '_id',
  foreignField: 'product'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product
