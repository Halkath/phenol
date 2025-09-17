const { EmbedBuilder } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const ticketSchema = require("../Schemas.js/ticketSchema");

module.exports = {
    name: "transcript",
    description: "Generate a transcript for the current ticket channel",
    usage: "?transcript <@user | userID>",
    async run(client, message, args) {
        const { guild, channel, member, author } = message;

        const data = await ticketSchema.findOne({ GuildId: guild.id });
        if (!data) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ Ticket system not set up.")
                        .setColor("Red")
                ]
            });
        }

        // Must be a support member
        if (!member.roles.cache.has(data.Role)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ You must be support staff to use this.")
                        .setColor(client.color)
                ]
            });
        }

        // Check if it's a valid ticket channel
        const topic = channel.topic;
        if (!topic || !topic.startsWith("Ticket Owner :")) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ This is not a valid ticket channel.")
                        .setColor(client.color)
                ]
            });
        }

        const ownerId = topic.split(": ")[1];
        const sendTo =
            message.mentions.users.first() ||
            guild.members.cache.get(args[0])?.user;

        if (!sendTo) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ You must mention a user or provide their ID to send the transcript.")
                        .setColor(client.color)
                ]
            });
        }

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`🔒 Ticket transcript is being created.\n${client.emoji?.arrow || "➡️"} Transcript will be sent.`)
                    .setColor(client.color || "Blue")
            ]
        });

        // Create transcript
        const transcript = await createTranscript(channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `ticket-${channel.name}.html`
        });

        const transcriptEmbed = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Ticket Transcript`, iconURL: guild.iconURL() })
            .addFields(
                { name: "Channel Name", value: `${channel.name}`, inline: true },
                { name: "Opened By", value: `<@${ownerId}>`, inline: true },
                { name: "Closed By", value: `${author.tag}`, inline: true }
            )
            .setColor(client.color || "Blue")
            .setTimestamp()
            .setFooter({ text: `${guild.name} Ticket Logs` });

        // Send transcript to logs
        const logChannel = guild.channels.cache.get(data.Logs);
        if (logChannel) {
            try {
                await logChannel.send({
                    content: `📄 Transcript from **${guild.name}**`,
                    embeds: [transcriptEmbed],
                    files: [transcript]
                });
            } catch (err) {
                console.error("Failed to send transcript to logs:", err);
            }
        }

        // Send transcript to requested user
        try {
            await sendTo.send({
                content: `📄 Transcript from **${guild.name}**`,
                embeds: [transcriptEmbed],
                files: [transcript]
            });
            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`✅ Transcript successfully sent to ${sendTo.tag} and logged.`)
                        .setColor(client.color)
                ]
            });
        } catch (err) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`⚠️ Failed to send transcript to ${sendTo.tag} (DMs might be off).`)
                        .setColor(client.color)
                ]
            });
        }
    }
};
