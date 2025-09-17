const { EmbedBuilder, PermissionBitField } = require("discord.js");

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server',
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setFooter({ text: `Sinux Development` })
            .setTimestamp();

        // Check permission
        if (!message.member.permissions.has(PermissionBitField.Flags.KickMembers)) {
            return message.reply({
                content: `<@${message.author.id}>`,
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} | Missing 'Kick Members' Permissions`)]
            });
        }

        // Fetch target user & reason
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const reason = args.slice(1).join(" ") || `${message.author.tag} has kicked the user.`;

        if (!user) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} | Mention a user or provide a valid ID to kick.`)]
            });
        }

        if (user.id === client.user.id) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} | I can't kick myself!`)]
            });
        }

        if (user.id === message.guild.ownerId) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} You can't kick the server owner!`)]
            });
        }

        const isOwn = message.author.id === message.guild.ownerId;
        if (!isOwn && message.member.roles.highest.position <= user.roles.highest.position) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} You must have a higher role than <@${user.id}> to kick them.`)]
            });
        }

        if (!user.kickable) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji?.cross || '❌'} I cannot kick this user!`)]
            });
        }

        // DM the user before kicking
        try {
            await user.send({
                embeds: [embed.setDescription(`${client.emoji.tick} | You were kicked by ${message.author.tag}\n${client.emoji.arrow} **Reason:** ${reason}`)]
            });
        } catch (err) {
            console.log(`DM failed before kick in ${message.guild.name}:`, err);
        }

        // Kick the user
        await user.kick(reason);

        // Try to delete recent messages
        try {
            const fetched = await message.channel.messages.fetch({ limit: 100 });
            const userMessages = fetched.filter(m =>
                m.author.id === user.id &&
                m.createdTimestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
            );
            await message.channel.bulkDelete(userMessages, true);
        } catch (err) {
            console.log(`Error deleting messages from kicked user:`, err);
        }

        // Confirmation
        return message.reply({
            embeds: [embed.setDescription(`${client.emoji.tick} | <@${user.id}> has been kicked.\n${client.emoji.arrow} **Reason:** ${reason}`)]
        });
    }
};
