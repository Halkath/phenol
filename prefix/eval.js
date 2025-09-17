const { EmbedBuilder, codeBlock } = require("discord.js");
const util = require("util");

const devs = ['820684158719492131', "1038755954772152400"]; // your dev IDs

module.exports = {
  name: "eval",
  aliases: ["Devil", "ev", "alone", "sinux"],
  category: "dev",
  run: async (client, message, args) => {
    // Only allow devs
    if (!devs.includes(message.author.id)) return;

    const content = args.join(" ");
    if (!content) return message.reply("⚠️ Please provide code to evaluate!");

    try {
      let evaled = await eval(content);

      if (typeof evaled !== "string") {
        evaled = util.inspect(evaled, { depth: 0 });
      }

      // Prevent token leaks
      if (evaled.includes(client.token)) {
        evaled = evaled.replace(new RegExp(client.token, "g"), "LOL BRO");
      }

      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(codeBlock("js", evaled));

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      let error = err.toString();

      if (error.includes(client.token)) {
        error = error.replace(new RegExp(client.token, "g"), "");
      }

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription(codeBlock("js", error));

      message.channel.send({ embeds: [embed] });
    }
  },
};

