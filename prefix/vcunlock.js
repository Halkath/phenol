const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  name: "vcunlock",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`${client.emoji.cross} | You need \`Manage Channels\` permission.`)]
      });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.member.voice.channel;
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Please mention a valid voice channel or join one.`)]
      });
    }

    await channel.permissionOverwrites.edit(message.guild.roles.everyone.id, { Connect: true });


    return message.reply({
      embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Unlocked **${channel.name}**`)]
    });
  }
};
