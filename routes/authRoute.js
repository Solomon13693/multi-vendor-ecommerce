const express = require('express');
const { Register, Login, VerifyAccount, ForgottenPassword, ResetPassword } = require('../controller/authController');

const router = express.Router()

router
    .route('/register')
    .post(Register)

router
    .route('/login')
    .post(Login)

router
    .route('/verify/:token')
    .post(VerifyAccount)

router
    .route('/forgot-password')
    .post(ForgottenPassword)

router
    .route('/reset-password/:token')
    .post(ResetPassword)

module.exports = router