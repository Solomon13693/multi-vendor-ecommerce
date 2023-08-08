const advanceResult = (model) => async (req, res, next) => {

    let query;

    // (1) FILTERING
    const queryObj = { ...req.query }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObj[el]);

    // Advance filterings
    const queryStr = JSON.stringify(queryObj)
    queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    query = model.find(JSON.parse(queryStr))

    // (2) SORTING OBJECT
    if (req.query.sort) {
        const sortBy = req.query.sort.split(' , ').join('')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // (3) FIELDS
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        query = query.select(fields)
    } else {
        query = query.select('-__v')
    }

    // (4) PAGINATION

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page - 1) * limit
    const endIndex = (page * limit)
    const total = await model.countDocuments()


    query = query.skip(startIndex).limit(limit)

    // Executing Object 
    const results = await query;

    // IMPLEMENT PAGINATION
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advanceResult = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()

}

module.exports = advanceResult