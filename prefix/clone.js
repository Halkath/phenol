const { EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mute a member for a specific duration with a reason',
    usage: 'mute @user [amount] [s|m|h|d] [reason]',
    aliases: [],

    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setFooter({ text: `Sinux Development` })
            .setTimestamp();

        // Permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | You are missing the 'Mute Members' permission.`)]
            });
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const amount = parseInt(args[1]);
        const timeType = args[2]?.toLowerCase(); // s, m, h, d
        const reason = args.slice(3).join(' ') || `${message.author.tag} has muted the user.`;

        if (!user) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | Please mention a user or provide their ID.`)]
            });
        }

        if (!amount || isNaN(amount)) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | Please provide a valid amount.`)]
            });
        }

        if (!['s', 'm', 'h', 'd'].includes(timeType)) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | Invalid time type. Use one of: s, m, h, d.`)]
            });
        }

        if (!user.moderatable) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | I cannot mute this user.`)]
            });
        }

        const unitMultipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        const maxTimeout = 28 * 24 * 60 * 60 * 1000; // 28 days
        const muteDuration = amount * unitMultipliers[timeType];

        if (!muteDuration || muteDuration <= 0 || muteDuration > maxTimeout) {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | Invalid duration. Must be greater than 0 and not more than 28 days.`)]
            });
        }

        // DM the user
        const dmEmbed = new EmbedBuilder()
            .setTitle('Muted from Server')
            .setDescription(`You have been muted in **${message.guild.name}** for **${amount} ${timeType}**\n${client.emoji.arrow} **Reason:** ${reason}`)
            .setColor(client.color);

        await user.send({ embeds: [dmEmbed] }).catch(() => { });

        // Mute the user
        await user.timeout(muteDuration, reason).catch(err => {
            return message.reply({
                embeds: [embed.setDescription(`${client.emoji.cross} | Failed to mute user: ${err.message}`)]
            });
        });

        // Confirm in channel
        const replyEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`${client.emoji.tick} | <@${user.id}> has been muted for **${amount} ${timeType}**.\n${client.emoji.arrow} **Reason:** ${reason}`);

        await message.reply({ embeds: [replyEmbed] });
    }
};
