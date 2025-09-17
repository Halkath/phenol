
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: "vcdeafen",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ You need `Deafen Members` permission.")] });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ Mention a user to deafen in VC.")] });

    if (!member.voice.channel) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ User is not in a voice channel.")] });
    }

    await member.voice.setDeaf(true, `${message.author.tag}`);
    return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`🔇 Deafened ${member.user.tag} in VC.`)] });
  }
};
