const { model, Schema } = require('mongoose');

const afkSchema = new Schema({
    User: {
        type: String,
        required: true
    },
    Guild: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        default: "I'm AFK"
    }
});

module.exports = model('afks', afkSchema);
