
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: "vcunmute",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ You need `Mute Members` permission.")] });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ Mention a user to unmute in VC.")] });

    if (!member.voice.channel) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ User is not in a voice channel.")] });
    }

    await member.voice.setMute(false, `${message.author.tag}`);
    return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`🔊 Unmuted ${member.user.tag} in VC.`)] });
  }
};
