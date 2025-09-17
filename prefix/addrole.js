const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'role',
    aliases: ['r'],
    category: 'mod',

    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(message.guild.iconURL());

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.channel.send({
                embeds: [embed
        .setDescription(`${client.emoji.cross} You need \`Manage Roles\` permission to use this.`)],
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.channel.send({
                embeds: [embed
                    .setDescription(`${client.emoji.cross} I need \`Manage Roles\` permission to execute this.`)],
            });
        }

        if (args.length < 2) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross}❌ Usage: \`role <user> <role>\``)],
            });
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} User not found.`)],
            });
        }

        const role = await findMatchingRole(message.guild, args.slice(1).join(' '));
        if (!role) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} Role not found.`)],
            });
        }

        if (role.managed) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} This role is managed by an integration.`)],
            });
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} I can't assign this role. It's higher or equal to my highest role.`)],
            });
        }

        if (message.member.roles.highest.position <= role.position) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} This role is higher or equal to your highest role.`)],
            });
        }

        const hasRole = member.roles.cache.has(role.id);
        if (hasRole) {
            await member.roles.remove(role, `${message.author.tag} removed the role`);
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.tick} | Removed <@&${role.id}> from <@${member.id}>.`)],
            });
        } else {
            await member.roles.add(role, `${message.author.tag} added the role`);
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.tick} | Added <@&${role.id}> to <@${member.id}>.`)],
            });
        }
    },
};

async function findMatchingRole(guild, query) {
    const mentionMatch = query.match(/<?@?&?(\d{17,20})>?/);
    if (mentionMatch) {
        const id = mentionMatch[1];
        return guild.roles.cache.get(id);
    }

    const lowerQuery = query.toLowerCase();
    return guild.roles.cache.find(role =>
        role.name.toLowerCase() === lowerQuery ||
        role.name.toLowerCase().startsWith(lowerQuery) ||
        role.name.toLowerCase().includes(lowerQuery)
    );
}
