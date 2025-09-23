const mongoose = require("mongoose");

const welcomeSetupSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    welcomeMessage:{
        type: String,
        default: `**Welcome ! To The Server.**`
    },
    useEmbed:{
        type: Boolean,
        default: false,
    },
    channelId: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("WelcomeSetup", welcomeSetupSchema);
