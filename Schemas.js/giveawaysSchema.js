const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  messageId: String,
  channelId: String,
  guildId: String,
  startAt: Number,
  endAt: Number,
  ended: Boolean,
  winnerCount: Number,
  prize: String,
  hostedBy: String,
  messages: Object,
  winners: [String],
  reaction: { type: String, default: "🎉" }
});

module.exports = mongoose.model("Giveaway", giveawaySchema);
