const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
const errorHandler = require('./utils/errorHandler')
const routes = require('./routes')
const ErrorResponse = require('./utils/errorResponse')
const cartReminder = require('./cron-jobs/cartReminder')
const stockLevel = require('./cron-jobs/stockLevel')
const app = express()

// APP .USER
app.use(express.json())
app.use(morgan('dev'))

// INIT ROUTER
app.use('/api/v1/', routes)

// NOT FOUND API 
app.use('*', (req, res, next) => {
    return next(new ErrorResponse(`${req.baseUrl} routes not found`, 404))
})

// CRON JOBS
cartReminder()
stockLevel()

app.use(errorHandler);

module.exports = app