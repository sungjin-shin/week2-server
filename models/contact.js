const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    nameContact: String,
    phoneNum: String
})

const contact = new Schema({
    email: String,
    contactList: [contactSchema]
});

module.exports = mongoose.model('contact', contact);