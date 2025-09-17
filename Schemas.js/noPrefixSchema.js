const mongoose = require("mongoose");

const noPrefixSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },

}, { timestamps: true});
module.exports = mongoose.model('NoPrefix', noPrefixSchema);