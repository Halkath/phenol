const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "avatar",
  aliases: ["av", "photo"],
  category: "info",
  run: async (client, message, args) => {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(
        (x) =>
          x.user.username.toLowerCase() === args.join(" ").toLowerCase() ||
          x.user.username === args[0]
      ) ||
      message.member;

    const avatar = member.user.displayAvatarURL({ size: 2048 });

    const embed = new EmbedBuilder()
      .setTitle(`${member.user.username}'s Avatar`)
      .setImage(avatar)
      .setDescription(
        `[\`PNG\`](${member.user.displayAvatarURL({
          size: 2048,
          extension: "png",
        })}) | [\`JPG\`](${member.user.displayAvatarURL({
          size: 2048,
          extension: "jpg",
        })}) | [\`WEBP\`](${member.user.displayAvatarURL({
          size: 2048,
          extension: "webp",
        })})`
      )
      .setColor("#2f3136");

    await message.reply({ embeds: [embed] });
  },
};
