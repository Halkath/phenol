const { model, Schema } = require("mongoose");

const ticketSchema = new Schema({
    GuildId: String,
    Category: String,
    Channel: String,
    Role: String,
    Logs: String,
});

module.exports = model("tickets", ticketSchema);
