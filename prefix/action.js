const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

// Only fun SFW actions
const validActions = [
  "cuddle", "hug", "kiss", "pat", "poke",
  "slap", "smug", "baka", "tickle", "feed"
];

module.exports = {
  name: "action",
  run: async (client, message, args) => {
    const action = args[0]?.toLowerCase();
    const taggedUser = message.mentions.users.first();

    if (!action || !validActions.includes(action)) {
      return message.reply(`Please provide a valid fun action: ${validActions.join(", ")}`);
    }
    if (!taggedUser) {
      return message.reply("Mention a user!");
    }

    const apiUrl = `https://nekos.life/api/v2/img/${action}`;

    try {
      const { data } = await axios.get(apiUrl);
      const imageUrl = data.url;

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`${message.author} **${action}s** ${taggedUser}`)
        .setImage(imageUrl);

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply("Failed to fetch the GIF.");
    }
  }
};
