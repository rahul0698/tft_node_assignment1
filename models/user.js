var mongoose = require('mongoose');

var Schema = mongoose.Schema;


module.exports = mongoose.model('User', new Schema({
    emailId: String,
    password: String,
    isActive: Boolean,
    token: String
}));