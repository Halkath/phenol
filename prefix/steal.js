const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "steal",
    aliases: ['addemoji', 'addemote'],
    category: 'info',
    run: async (client, message, args) => {

        // If no args, show usage
        if (!args.length) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color || "#ffcc00")
                        .setTitle("Command Usage")
                        .setDescription(`**Usage:** \`${message.prefix || "?"}steal <emoji> <name>\`\n\nExample:\n\`${message.prefix || "?"}steal <:smile:123456789012345678> smiley\``)
                ]
            });
        }

        // Permission checks
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color || "#ff0000")
                        .setDescription(`${client.emoji.cross || "❌"} | You need \`Manage Emojis and Stickers\` permission to use this command.`)
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color || "#ff0000")
                        .setDescription(`${client.emoji.cross || "❌"} | I need \`Manage Emojis and Stickers\` permission to add emojis.`)
                ]
            });
        }

        let emoji = args[0];
        let name = args[1];

        if (!emoji) {
            return message.reply("**Provide an emoji to steal.**");
        }
        if (!name) {
            return message.reply(`__Command Usage__\n\n?steal <emoji> <name>\n**Missing name for emoji.**`);
        }

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0]; // get the emoji ID

            // check if emoji is animated or not
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
                .then(res => (res.status === 200 ? "gif" : "png"))
                .catch(() => "png");

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
        }

        // prevent default emojis
        if (!emoji.startsWith("http")) {
            return await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.emoji.cross || "❌"} | Cannot add default Unicode emojis.`)
                        .setColor(client.color || "#ff0000")
                ]
            });
        }

        // Create emoji
        message.guild.emojis.create({
            attachment: emoji,
            name: name
        }).then(em => {
            const embed = new EmbedBuilder()
                .setColor(client.color || "#00ff00")
                .setTitle(`${client.emoji.tick || "✅"} Emoji Added!`)
                .setDescription(`Added ${em} \nName: \`${name}\``)
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }).catch(error => {
            return message.reply({
                content: `${client.emoji.cross} | Failed to add emoji. Make sure there are slots available and name does not contain spaces.`
            });
        });

    },
};
