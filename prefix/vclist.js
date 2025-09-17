
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "vclist",
  run: async (client, message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("❌ You are not in a voice channel.")] });
    }

    const members = voiceChannel.members.map(m => `${m.user.tag}`).join('\n') || 'No members';
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🔊 Members in ${voiceChannel.name}`)
          .setDescription(members)
          .setColor('Blue')
      ]
    });
  }
};
