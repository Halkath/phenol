const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "delemoji",
    aliases: ['removeemoji', 'deletemoji'],
    category: 'info',
    run: async (client, message, args) => {

        // Show usage if no args
        if (!args.length) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ffcc00")
                        .setTitle("📌 Command Usage")
                        .setDescription(`**Usage:** \`${message.prefix || "?"}delemoji <emoji|emoji_name|emoji_id> [emoji2] ...\`\n\nExamples:\n\`${message.prefix || "?"}delemoji <:smile:123456789012345678>\`\n\`${message.prefix || "?"}delemoji smiley wave\``)
                ]
            });
        }

        // Permission checks
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff0000")
                        .setDescription(`❌ You need \`Manage Emojis and Stickers\` permission to use this command.`)
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | I need \`Manage Emojis and Stickers\` permission to delete emojis.`)
                ]
            });
        }

        let results = [];

        for (const arg of args) {
            let emojiId = null;
            let emojiName = null;

            // Match ID from emoji format or raw ID
            const emojiMatch = arg.match(/(\d+)/);
            if (emojiMatch) emojiId = emojiMatch[0];

            // If not ID, maybe it's a name
            if (!emojiId) emojiName = arg;

            let emoji = null;
            if (emojiId) {
                emoji = message.guild.emojis.cache.get(emojiId);
            } else if (emojiName) {
                emoji = message.guild.emojis.cache.find(e => e.name.toLowerCase() === emojiName.toLowerCase());
            }

            if (!emoji) {
                results.push(`${client.emoji.cross} | Emoji not found: \`${arg}\``);
                continue;
            }

            try {
                await emoji.delete(`Deleted by ${message.author.tag}`);
                results.push(`${client.emoji.tick} | Deleted emoji: \`${emoji.name}\``);
            } catch (err) {
                results.push(`${client.emoji.cross} | Failed to delete emoji: \`${emoji.name}\``);
            }
        }

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("<:sinux_error:1405510166715301988> | Emoji Delete Results")
                    .setDescription(results.join("\n"))
            ]
        });
    }
};
