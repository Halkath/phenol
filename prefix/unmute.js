const { EmbedBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',
    usage: 'unmute @user or userID',
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setFooter({ text: 'Sinux Development' })
            .setTimestamp();

        if (!message.member.permissions.has(PermissionBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [embed.setDescription('❌ You are missing the **Mute Members** permission.')]
            });
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!user) {
            return message.reply({
                embeds: [embed.setDescription('❌ Please mention a user or provide a valid user ID.')]
            });
        }

        if (!user.moderatable) {
            return message.reply({
                embeds: [embed.setDescription('❌ I cannot unmute this user.')]
            });
        }

        try {
            await user.timeout(null); // Remove mute
            return message.reply({
                embeds: [embed.setDescription(`✅ <@${user.id}> has been unmuted.`)]
            });
        } catch (err) {
            return message.reply({
                embeds: [embed.setDescription(`❌ Failed to unmute: ${err.message}`)]
            });
        }
    }
};
