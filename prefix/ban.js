const { EmbedBuilder, PermissionBitField } = require("discord.js");

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server',
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setFooter({ text: `Sinux Development` })
            .setTimestamp();

        // Permission check
        if (!message.member.permissions.has(PermissionBitField.Flags.BanMembers)) {
            return message.reply({
                content: `<@${message.author.id}>`,
                embeds: [embed.setDescription(`${client.emoji.cross} | Missing 'Ban Members' Permissions`)]
            });
        }

        // Target user and reason
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const reason = args.slice(1).join(" ") || `${message.author.tag} has banned the user.`;

        if (!user) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross || '❌'} Mention a user or provide a valid ID to ban.`)]
            });
        }

        if (user.id === client.user.id) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} I can't ban myself!`)]
            });
        }

        if (user.id === message.guild.ownerId) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} You can't ban the server owner!`)]
            });
        }

        const isOwn = message.author.id === message.guild.ownerId;
        if (!isOwn && message.member.roles.highest.position <= user.roles.highest.position) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} You must have a higher role than <@${user.id}> to ban them.`)]
            });
        }

        if (!user.bannable) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} I cannot ban this user!`)]
            });
        }

        // Attempt to DM the user
        try {
            await user.send({
                embeds: [embed.setDescription(`${client.emoji.tick} | You were banned by ${message.author.tag}\n**Reason:** ${reason}`)]
            });
        } catch (err) {
            console.log(`${client.emoji.cross} | DM failed before ban in ${message.guild.name}:`, err);
        }

        // Ban the user and delete 7 days of messages
        await user.ban({
            reason: reason,
            deleteMessageSeconds: 7 * 24 * 60 * 60
        });

        // Confirm in channel
        return message.reply({
            embeds: [embed.setDescription(`${client.emoji.tick} | <@${user.id}> has been banned.\n**Reason:** ${reason}`)]
        });
    }
};
