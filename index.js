const app = require('./app')
const connectDB = require('./config/database')

const PORT = process.env.PORT
require('colors')

connectDB()

app.listen(PORT, () => {
    console.log(`Multi Vendor Ecommerce listening on port ${PORT}`.yellow.italic);
})