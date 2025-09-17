const { EmbedBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a user by ID',
    usage: 'unban userID [reason]',
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setFooter({ text: 'Sinux Development' })
            .setTimestamp();

        if (!message.member.permissions.has(PermissionBitField.Flags.BanMembers)) {
            return message.reply({
                embeds: [embed.setDescription('❌ You are missing the **Ban Members** permission.')]
            });
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || `${message.author.tag} has unbanned the user.`;

        if (!userId || isNaN(userId)) {
            return message.reply({
                embeds: [embed.setDescription('❌ Please provide a valid user ID.')]
            });
        }

        try {
            await message.guild.bans.fetch(); // Ensure the cache is updated
            await message.guild.members.unban(userId, reason);

            return message.reply({
                embeds: [embed.setDescription(`✅ User with ID \`${userId}\` has been unbanned.\n**Reason:** ${reason}`)]
            });
        } catch (err) {
            return message.reply({
                embeds: [embed.setDescription(`❌ Failed to unban: ${err.message}`)]
            });
        }
    }
};
