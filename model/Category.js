const mongoose = require('mongoose')
const slugify = require('slugify')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
});

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

categorySchema.pre('findOneAndUpdate', function (next) {
  if (this._update.name && this._update.name !== this._conditions.name) {
    this._update.slug = slugify(this._update.name, { lower: true });
  }
  next();
});


// DELETE ALL PRODUCTS THAT HAS CATEGORY

categorySchema.post('remove', async function (doc, next) {
  const categoryId = doc._id;
  // Delete all products associated with the category
  await Product.deleteMany({ category: categoryId });
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
