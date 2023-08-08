const { Schema } = require("mongoose");
const mongoose = require('mongoose');

const walletSchema = Schema(
    {
        balance: { type: Number, default: 0 },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
    },
    { 
        timestamps: true 
    });

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet