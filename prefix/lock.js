const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: 'lock',
    aliases: ['l', 'lc'],
    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const error = new EmbedBuilder()
                .setColor(client.color || 0xff0000)
                .setDescription(`${client.emoji.cross || "❌"} | You must have \`Manage Channels\` permission to use this command.`);
            return message.reply({ embeds: [error] });
        }

        const reason1 = args.slice(1).join(" ") || `Command run by ${message.author.tag}`;

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        if (channel.manageable) {
            await channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: false
            }, { reason: reason1 });

            const emb = new EmbedBuilder()
                .setDescription(`${channel} has been locked for @everyone.`)
                .setColor(client.color || 0x2f3136);
            return message.channel.send({ embeds: [emb] });
        } else {
            const embi = new EmbedBuilder()
                .setDescription(`${client.emoji.cross} | I don't have adequate permissions to lock this channel.`)
                .setColor(client.color || 0xff0000);
            return message.channel.send({ embeds: [embi] });
        }
    }
}
