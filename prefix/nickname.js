const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nick',
    description: 'Change the nickname of a user',
    usage: 'nick <@user> <new nickname>',
    aliases: ['nickname'],

    async run(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply(`${client.emoji.cross} | You do not have permission to change nicknames.`);
        }
if (!args.length) {
            return message.reply(`${client.emoji.tick} | Incorrect usage.\n${client.emoji.arrow} **Usage:** \`${message.prefix || '?'}nick <@user|userID> <new nickname>\``);
        }
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.reply(`${client.emoji.cross} | Please mention a valid user or provide their ID.`);
        }

        const newNick = args.slice(1).join(" ");
        if (!newNick) {
            return message.reply(`${client.emoji.tick} | Please provide a new nickname.`);
        }

        try {
            await member.setNickname(newNick, `Changed by ${message.author.tag}`);
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`${client.emoji.tick} | Changed nickname of **${member.user.tag}** to **${newNick}**`);

            return message.channel.send({ embeds: [embed] });
        } catch (err) {
            return message.reply(`${client.emoji.cross} | Failed to change nickname: ${err.message}`);
        }
    }
};

