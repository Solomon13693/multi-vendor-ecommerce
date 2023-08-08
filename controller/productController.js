const Product = require('../model/Product')
const Vendor = require('../model/Vendor')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const cloudinary = require('../config/cloudinary')
const User = require('../model/User')

// @desc    Create Product data
// @route   POST /api/product
// @access  Private
exports.createProduct = asyncHandler(async (req, res, next) => {

    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
        return next(new ErrorResponse('Vendor not found', 404));
    }

    const uploadedImages = [];
    for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'm_v_e/products',
            width: 1080, height: 1080, crop: "fill"
        });
        const image = {
            public_id: result.public_id,
            url: result.secure_url,
        };
        uploadedImages.push(image);
    }

    const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category,
        vendor: vendor._id,
        specifications: {
            color: req.body.specifications.color,
            size: req.body.specifications.size,
            weight: req.body.specifications.weight,
        },
        shipping: req.body.shipping,
        images: uploadedImages,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        product,
    });

});

// @desc    Update Product data
// @route   PATCH /api/product/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const vendor = await Vendor.findOne({ user: user._id });

    if (!vendor) {
        return next(new ErrorResponse('Vendor not found', 404));
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product with id of ${req.params.id} not found`, 404));
    }

    if (!compareVendorAndUser(vendor, user)) {
        return next(new ErrorResponse('Not authorized to perform this action', 401));
    }

    product.name = req.body.name;
    product.description = req.body.description;
    product.specifications.color = req.body.specifications.color;
    product.specifications.size = req.body.specifications.size;
    product.specifications.weight = req.body.specifications.weight;
    product.shipping = req.body.shipping;

    product = await product.save();

    return res.status(200).json({
        status: 'success',
        message: `Product ${product.name} updated successfully`,
        product,
    });
});


// @desc    Get Products data
// @route   GET /api/product
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {

    let query;

    const queryObj = { ...req.query }

    const removeField = ['select', 'sort', 'page', 'limit', 'search']
    removeField.forEach((params) => delete queryObj[params])

    // get data
    query = Product.find(queryObj).populate({
        path: 'reviews',
        select: 'user rating comment', // Select specific fields for the populated reviews
      });

    const { select, sort, page, limit, search } = req.query

    if (select) {
        const fields = select.split(',').join(' ')
        query = query.select(fields)
    }

    if (sort) {
        const fields = sort.split(',').join(' ')
        query = query.sort(fields)
    } else {
        query = query.sort('-createdAt')
    }

    if (search) {

        const searchTerm = req.query.search; // Search term provided by the user
        const searchTermRegex = new RegExp(searchTerm, 'i'); // Dynamic regular expression pattern

        query.or([
            { name: searchTermRegex },
            { description: searchTermRegex }
        ]);

    }

    if (queryObj.category) {
        const category = await Category.findOne({ name: queryObj.category })
        query.where('category').equals(category?._id)
    }

    // Pagination
    const pages = parseInt(page, 10) || 1
    const limits = parseInt(limit, 10) || 10
    const startIndex = (pages - 1) * limits
    const endIndex = pages * limits
    const total = await Product.countDocuments()

    query = query.skip(startIndex).limit(limits)

    // Execute
    const products = await query

    // Pagination Result
    let pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: pages + 1,
            limits
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: pages - 1,
            limits
        }
    }

    return res.status(200).json({
        status: 'success',
        data: {
            products,
            pagination
        }
    });

})

// @desc    Get Product data
// @route   GET /api/product/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {

    const product = await Product.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'user rating comment', // Select specific fields for the populated reviews
      });;

    if (!product) {
        return next(new ErrorResponse(`Product with ${req.params.slug} not found`, 404))
    }

    return res.status(200).json({ 
        status: 'success',
        product
    });

})

// @desc    Update Product data
// @route   DELETE /api/product/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    const vendor = await Vendor.findOne({ user: user._id });
    
    if (!vendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }
    
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product with id of ${req.params.id} not found`, 404));
    }
    
    if (!compareVendorAndUser(vendor, user)) {
      return next(new ErrorResponse('Not authorized to perform this action', 401));
    }
    
    // Delete the associated images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    
    // Delete the product from the database
    await Product.findByIdAndDelete(product._id);
    
    return res.status(200).json({
      status: 'success',
      message: `Product ${product.name} deleted successfully`,
    });
  });
  
  

// @desc     Delete product image
// @route   DELETE /api/product/:productId/image/:imagePublicId
// @access  Private
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
    const { productId, imagePublicId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Find the index of the image to be deleted
    const imageIndex = product.images.findIndex((image) => image.public_id === imagePublicId);

    if (imageIndex === -1) {
        return next(new ErrorResponse('Image not found', 404));
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(imagePublicId);

    // Remove the image from the product's images array
    product.images.splice(imageIndex, 1);

    // Save the updated product
    await product.save();

    return res.status(200).json({
        status: 'success',
        message: 'Product image deleted successfully',
        product,
    });
});

// @desc    Update product image
// @route   PATCH /api/product/:productId/image/:imagePublicId
// @access  Private
exports.updateProductImage = asyncHandler(async (req, res, next) => {

    const { productId, imagePublicId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Find the index of the image to be updated
    const imageIndex = product.images.findIndex((image) => image.public_id === imagePublicId);

    if (imageIndex === -1) {
        return next(new ErrorResponse('Image not found', 404));
    }

    const uploadedImage = await cloudinary.uploader.upload(req.file.path);

    // Delete the previous image from Cloudinary
    await cloudinary.uploader.destroy(imagePublicId);

    // Update the image details in the product's images array
    product.images[imageIndex].public_id = uploadedImage.public_id;
    product.images[imageIndex].url = uploadedImage.secure_url;

    // Save the updated product
    await product.save();

    return res.status(200).json({
        status: 'success',
        message: 'Product image updated successfully',
        product,
    });

});

// @desc    Upload product Image
// @route   POST /api/product/:productId/image
// @access  Private
exports.uploadProductImage = asyncHandler(async (req, res, next) => {

    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    const uploadedImage = await cloudinary.uploader.upload(req.file.path);

    // Add the uploaded image to the product's images array
    const newImage = {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
    };

    product.images.push(newImage);

    // Save the updated product
    await product.save();

    return res.status(200).json({
        status: 'success',
        message: 'Product image uploaded successfully',
        product,
    });
});

// @desc    Get Vendor All Products
// @route   GET /api/products/vendor
// @access  public
exports.getProductsByVendor = asyncHandler(async (req, res, next) => {

    const { code } = req.query

    const vendor = await Vendor.findOne({ code })

    if (!vendor) {
        return next(new ErrorResponse('Vendor not found', 404));
    }

    const products = await Product.find({ vendor: vendor._id });

    return res.status(200).json({
        status: 'success',
        products
    });

})

const compareVendorAndUser = (vendor, user) => {
    return vendor.user.toString() === user.id
}