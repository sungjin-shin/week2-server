//image 스키마
//image.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//IMAGE SCHEMA
var imageSchema = new Schema({
    name: String,
    filepath: String
});

// DEFINE MODEL
//var Image = mongoose.model('image', imageSchema);

//MODULIZE
module.exports = mongoose.model('image', imageSchema);