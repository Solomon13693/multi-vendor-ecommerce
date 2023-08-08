const User = require('../model/User')
const Vendor = require('../model/Vendor')
const Product = require('../model/Product')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const cloudinary = require('../config/cloudinary')

// @desc    Register Vendor
// @route   POST /api/v1/vendor/auth/register
// @access  Private
exports.Register = asyncHandler(async (req, res, next) => {

    const { companyName, description, socialMediaProfiles, openingTime, closingTime, email, phone, address } = req.body;

    if (await Vendor.findOne({ user: req.user.id })) {
        return next(new ErrorResponse('User already registered as a vendor', 500))
    }

    if (await Vendor.findOne({ companyName })) {
        return next(new ErrorResponse('Company name already exist', 500))
    }

    if (await Vendor.findOne({ phone })) {
        return next(new ErrorResponse('Phone number already exist', 500))
    }

    if (await Vendor.findOne({ email })) {
        return next(new ErrorResponse('Email address already exist', 500))
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'm_v_e/vendor/logo',
        width: 500, height: 500, crop: "fill"
    })

    const vendor = await Vendor.create({
        companyName,
        user: req.user.id,
        description,
        socialMediaProfiles,
        openingTime,
        closingTime,
        email,
        phone,
        address,
        logo: {
            public_id: result.public_id,
            url: result.url
        }
    });

    // ADD VENDOR ROLE TO USER ROLE
    const user = await User.findById(req.user.id);
    user.role.push('vendor');
    await user.save();

    // Send an email to the vendor

    res.status(201).json({
        success: true,
        message: 'Vendor registered successfully',
        data: vendor,
    });
});

// @desc    Login user
// @route   POST /api/v1/vendor/auth/login
// @access  Public
exports.Login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please enter your email address and password', 422));
    }

    const user = await User.findOne({ email: email }).select('+password +verified +role');

    if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    if (user.verified === false) {
        await verifyUser(user);
        return next(new ErrorResponse('An Email sent to your mail, Please verify your account', 401));
    }

    if (user.role.includes('vendor')) {
        const jwt = await user.JwtToken();
        return res.status(200).json({
            status: 'success',
            token: jwt
        });
    } else {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }
});

// @desc    Register user
// @route   POST /api/v1/vendor/update
// @access  Private
exports.updateVendor = asyncHandler(async (req, res, next) => {
    let vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
        return next(new ErrorResponse('Vendor not found', 404));
    }

    const { companyName, description, openingTime, closingTime, phone, email } = req.body;

    let logoUploadResult;
    let coverUploadResult;

    // Upload the logo image to Cloudinary if included in the request
    if (req.files && req.files['logo']) {

        if (vendor.logo && vendor.logo.public_id) {
            await cloudinary.uploader.destroy(vendor.logo.public_id);
        }

        logoUploadResult = await cloudinary.uploader.upload(req.files['logo'][0].path, {
            folder: 'm_v_e/vendor/logo',
            width: 500,
            height: 500,
            crop: 'fill',
        });
    }

    // Upload the cover photo image to Cloudinary if included in the request
    if (req.files && req.files['coverPhoto']) {

        if (vendor.coverPhoto && vendor.coverPhoto.public_id) {
            await cloudinary.uploader.destroy(vendor.coverPhoto.public_id);
        }

        coverUploadResult = await cloudinary.uploader.upload(req.files['coverPhoto'][0].path, {
            folder: 'm_v_e/vendor/cover',
            width: 1080,
            height: 480,
        });
    }

    const updateField = {
        companyName,
        description,
        openingTime,
        closingTime,
        phone,
        email,
    };

    // Update the logo if uploaded
    if (logoUploadResult) {
        updateField.logo = {
            public_id: logoUploadResult.public_id,
            url: logoUploadResult.url,
        };
    }

    // Update the cover photo if uploaded
    if (coverUploadResult) {
        updateField.coverPhoto = {
            public_id: coverUploadResult.public_id,
            url: coverUploadResult.url,
        };
    }

    vendor = await Vendor.findByIdAndUpdate(vendor._id, updateField, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor,
    });
});

// ======= PRODUCTS ======== //

// @desc    Get Vendor All Products
// @route   POST /api/vendor/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res, next) => {

    const vendor = await Vendor.findOne({ user: req.user.id })

    if (!vendor) {
        return next(new ErrorResponse('Vendor not found', 404));
    }

    const products = await Product.find({ vendor: vendor._id });

    return res.status(200).json({
        status: 'success',
        data: {
            products
        }
    });

})

// @desc    Get Vendor All Products
// @route   POST /api/vendor/product/:id
// @access  Private
exports.getProduct = asyncHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    return res.status(200).json({
        status: 'success',
        product
    });

})

// @desc    Get Vendor All Products
// @route   POST /api/vendor/product/:id/discount
// @access  Private
exports.applyDiscount = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const { discountPercentage } = req.body

    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Calculate the discounted price
    const discountedPrice = product.price * (1 - discountPercentage / 100);

    // Update the product's discounted price
    product.discountedPrice = discountedPrice;
    await product.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Discount applied successfully', product });

})

// @desc    Get Vendor All Products
// @route   POST /api/vendor/product/:id/discount
// @access  Private
exports.removeDiscount = asyncHandler(async (req, res, next) => {

    const { id } = req.params

    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    // Update the product's discounted price
    product.discountedPrice = undefined || 0;
    await product.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Discount removed successfully', product });

})

// @desc    Get Vendor Profile
// @route   POST /api/vendor/:code
// @access  Public
exports.getVendor = asyncHandler(async (req, res, next) => {
    const { code } = req.params;
  
    const vendor = await Vendor.findOne({ code }).populate({
      path: 'products',
      select: 'name price quantity images',
    });
  
    if (!vendor) {
      return next(new ErrorResponse(`No such vendor with code: ${code}`, 404));
    }
  
    return res.status(200).json({
      status: 'success',
      data: { vendor },
    });
  });
  
  

const compareVendorAndUser = (vendor, user) => {
    return vendor.user.toString() !== user.id
}

