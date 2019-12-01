const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    msg: String
});

module.exports = mongoose.model('test', testSchema);