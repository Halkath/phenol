const { Embedbuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "hide",
    description: "Hides a channel from the user",
    run: async (message, args) => {
        const embed = new Embedbuilder()
            .setColor("Random")
            .setFooter({
                text: `Made By Sinux Devlopment`
            })

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                embeds: [
                    embed.setDescription(`You are missing \`Manage Channels\` permission to use this command.`)
                ]
            })
        }
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        if (channel.manageable) {
            channel.permissionOverwrites.edit(message.guild.id, {
                VIEW_CHANNEL: true,
                reason: `command used by ${message.author.tag}`
            })

            return message.reply({
                embeds: [
                    embed.setDescription(`<:Sinux_done:1089424114726486047> | ${channel} has been unhidden for @everyone role`)
                ]
            })
        } else {
            return message.reply({
                embeds: [
                    embed.setDescription(`I don't have adequate permissions to unhide this channel.\n**Execution Status :** ${client.emoji.cross || "❌"}`)
                ]
            })
        }

    },
};