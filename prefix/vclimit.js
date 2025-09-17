const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  name: "vclimit",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`${client.emoji.cross} | You need \`Manage Channels\` permission.`)]
      });
    }
     if(!args[0] && !args[1]){
          return message.reply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Wrong Argument.\n${client.emoji.arrow} Usage: \n**?vclimit <channel_link/channel_id> <limit_amt>**`)]
      });
     }
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.member.voice.channel;
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Please mention a valid voice channel or join one.`)]
      });
    }

    const limit = parseInt(args[1]);
    if (isNaN(limit) || limit < 0 || limit > 99) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Provide a valid user limit (0-99).`)]
      });
    }

    await channel.setUserLimit(limit);

    return message.reply({
      embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Set user limit of **${channel.name}** to **${limit}**`)]
    });
  }
};

