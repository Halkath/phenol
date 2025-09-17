
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: "vckick",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ You need `Move Members` permission.")] });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ Mention a user to kick from VC.")] });

    if (!member.voice.channel) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ User is not in a voice channel.")] });
    }

    await member.voice.disconnect();
    return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`👢 Kicked ${member.user.tag} from VC.`)] });
  }
};
