const { Embedbuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "hide",
    description: "Hides a channel from the user",
    run: async (message, args) => {
        const embed = new Embedbuilder()
            .setColor(client.color)
            .setFooter({
                text: `Made By Sinux Devlopment`
            })

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | You are missing \`Manage Channels\` permission to use this command.`)
                ]
            })
        }
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        if (channel.manageable) {
            channel.permissionOverwrites.edit(message.guild.id, {
                VIEW_CHANNEL: false,
                reason: `command used by ${message.author.tag}`
            })

            return message.reply({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | ${channel} has been hidden for @everyone role`)
                ]
            })
        } else {
            return message.reply({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | I don't have adequate permissions to hide this channel.\n**Execution Status :** ${client.emoji.cross || "❌"}`)
                ]
            })
        }

    },
};