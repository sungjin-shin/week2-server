const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservInfo = new Schema({
    email: String,
    checkIn: String,
    checkOut: String
})
const hotel = new Schema({
    loc: String,
    hotelName: {type: String, unique: true},
    lati: String,
    longi: String,
    reservList: [reservInfo]
});

module.exports = mongoose.model('accommodation', hotel);