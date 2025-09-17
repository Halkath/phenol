const { model, Schema } = require("mongoose"); 

let reviewSchema = new Schema({
    Guild: String,
    Channel: String,
    Count: {
        type: Number,
        default: 0
    }
});

module.exports = model("reviewSchema", reviewSchema);