const mongoose = require("mongoose");

const antinukeSchema = new mongoose.Schema({
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    whitelist: {
        type: [String],
        default: [],
    },
});

module.exports = mongoose.model("Antinuke", antinukeSchema);