const geolib = require('geolib')
const City = require('../../model/City')
const Vendor = require('../../model/Vendor')
const ErrorResponse = require('../../utils/errorResponse');

exports.calculateDistance = async (cityId, vendorId) => {

    const cityLoc = await City.findById(cityId);
    const vendorLoc = await Vendor.findById(vendorId);

    if (!cityLoc || !vendorLoc) {
        return next(new ErrorResponse('City or vendor not found', 404));
    }

    const distance = await geolib.getDistance(cityLoc?.coordinates, vendorLoc?.location?.coordinates);
    const kilometer = distance / 1000;
    const price = cityLoc.baseFee + kilometer;

    return price;
};


