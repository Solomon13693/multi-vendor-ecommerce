const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        reference: {
            type: String
        },
        reference_id: {
            type: String
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        amount: {
            type: Number,
            required: [true, "amount is required"],
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending', 'abandoned', 'cancelled'],
            default: 'pending',
        },
        description: {
            type: String
        },
        paymentGateway: {
            type: String,
            enum: ["Flutterwave", 'Paystack', 'Wallet'],
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: true,
    }
);

transactionSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name email phone' })
    next()
})

transactionSchema.pre('save', function (next) {
    if (!this.reference_id) {
        this.reference_id = uuidv4();
    }
    next();
});

// '0' => 'pending',
// '1' => 'successful',
// '2' => 'failled',
// '3' => 'cancelled',
// '4' => 'abandoned',

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction