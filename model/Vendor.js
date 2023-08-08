const mongoose = require('mongoose');
const validator = require('validator')
const { v4: uuidv4 } = require('uuid');
const geocoder = require('../utils/geocoder');

const vendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: [true, 'User already registered as a vendor'],
        required: true,
    },
    companyName: {
        type: String,
        unique: [true, 'Company Name already exist'],
        required: true,
    },
    code: String,
    description: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, 'Email address is not valid'],
        required: [true, "Email address is required"]
    },
    logo: {
        public_id: {
            type: String,
            require: [true, 'Logo is required']
        },
        url: {
            type: String,
            require: [true, 'Logo is required']
        },
    },
    coverPhoto: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    commissionRate: {
        type: Number,
        default: 0.1,
        select: false
    },
    openingTime: {
        type: String,
        required: true,
    },
    closingTime: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    socialMediaProfiles: {
        type: Array,
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: 'At least one social media profile is required',
        },
        required: [true, 'Social media profiles are required'],
    },
    joined: {
        type: Date,
        default: Date.now,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

vendorSchema.pre('save', function (next) {
    this.code = uuidv4().split('-')[0]
    next()
})

vendorSchema.virtual('products', {
    ref: 'Product', // Reference the Product model
    localField: '_id', // The field in the vendor model that is used for populating (vendor's _id)
    foreignField: 'vendor', // The field in the Product model that holds the reference to the vendor's _id
});

vendorSchema.pre('save', async function (next) {

    const loc = await geocoder.geocode(this.address)

    this.location = {
        type: 'point',
        coordinates: [loc[0].latitude, loc[0].longitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].street,
        city: loc[0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
    }

    next()

})

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
