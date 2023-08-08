const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../model/Transaction');

const createTransaction = async (user, type, amount, status, reference, paymentGateway, description, details) => {

    let transaction = await Transaction.findOne({ reference });

    if (!transaction) {

        transaction = new Transaction({
            type: type,
            amount: amount,
            status: status,
            reference,
            user: user._id,
            description: description,
            paymentGateway: paymentGateway,
            details: details

        });

    } else {

        transaction.type = type;
        transaction.amount = amount;
        transaction.status = status;
        transaction.details = details;

    }

    transaction.save();

};

exports.creditTransaction = async (user, type = "credit", amount, status, reference, paymentGateway, description, details) => {

    await createTransaction(user, type, amount, status, reference, paymentGateway, description, details);
};

exports.debitTransaction = async (user, type = "debit", amount, status, reference, paymentGateway, description, details) => {
    await createTransaction(user, type, amount, status, reference, paymentGateway, description, details);
};


// GET USER TRANSACTIONS 
exports.getUserTransaction = asyncHandler(async (req, res, next) => {

    const queryObj = { ...req.query };

    const { type, ...otherQueryParams } = queryObj;

    const query = { user: req.user.id, ...otherQueryParams };

    if (type) {
        query.type = type;
    }

    const transactions = await Transaction.find(query);


    res.status(200).json({
        status: "success",
        data: transactions
    })

})

// GET ALL TRANSACTIONS

exports.getTransactions = asyncHandler(async (req, res, next) => {

    const queryObj = { ...req.query };

    const { status, ...otherQueryParams } = queryObj;

    const query = { ...otherQueryParams };

    if (status) {
        query.status = status;
    }

    const transactions = await Transaction.find(query);


    res.status(200).json({
        status: "success",
        data: transactions
    })

})

exports.getTransaction = asyncHandler(async (req, res, next) => {

    const transaction = await Transaction.findById(req.params.id);

    res.status(200).json({
        status: "success",
        data: transaction
    })

})