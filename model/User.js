const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateCode = require('../utils/generateCode');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [8, 'Name must be a least 8 characters above'],
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, 'Email address is not valid'],
        required: [true, "Email address is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    },
    profile: {
        type: String,
    },
    role: {
        type: [String],
        enum: ['admin', 'vendor', 'user'],
        default: ['user'],
    },
    verified: {
        type: Boolean,
        default: false,
        select: false
    },
    joined: {
        type: Date,
        default: Date.now()
    },
    token: String,
    tokenExpires: Date,
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next() 
    this.password = await bcrypt.hash(this.password, 12)
})

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// GENERATE VERIFICATION CODE AND RESET PASSWORD CODE
userSchema.methods.generateCode = function (length) {
    const code = generateCode(length)
    this.token = crypto.createHash('sha512').update(code).digest('hex')
    this.tokenExpires = new Date(Date.now() + 60 * 60 * 1000)
    return code
}

// GENERATE JWT TOKEN
userSchema.methods.JwtToken = async function () {
    return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
}

const User = mongoose.model('User', userSchema)

module.exports = User