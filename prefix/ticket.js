const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ChannelType,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionFlagsBits,
    ButtonStyle
} = require("discord.js");

const ticketSchema = require("../Schemas.js/ticketSchema");

module.exports = {
    name: 'ticket',
    description: "Provide a setup ticket",
    run: async (client, message, args) => {
        const subcmd = args[0];

        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await message.reply({
                content: `${client.emoji.cross} You are missing the **Administrator** permission to use this command.`
            });
        }

        if (subcmd === "setup") {
            return setupTicket(message, client);
        } else if (subcmd === "logs") {
            return setLogs(message, client, args);
        } else if (subcmd === "srole") {
            return setRole(message, client, args);
        } else if (subcmd === "panel") {
            return setPanel(message, client, args);
        } else if (subcmd === "category") {
            return setCategory(message, client, args);
        } else if (subcmd === "disable") {
            return setDisable(message, client);
        }
    },
};

// --- Setup Ticket Panel ---
async function setupTicket(message, client) {
    let guildId = message.guild.id;
    const exist = await ticketSchema.findOne({ GuildId: guildId });

    if (!exist || !exist.Category || !exist.Role || !exist.Logs || !exist.Channel) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setFooter({ text: `Made By Sinux Development` })
                    .setTitle(`${client.emoji.cross} | Ticket System Setup Incomplete`)
                    .setDescription("You must configure all required options before using `?ticket setup`.")
                    .addFields(
                        { name: `${client.emoji.arrow} ?ticket category <category_id>`, value: `Set the category for tickets.` },
                        { name: `${client.emoji.arrow} ?ticket srole <role_mention>/<role_id>`, value: `Set the support role.` },
                        { name: `${client.emoji.arrow} ?ticket logs <channel>`, value: `Set the logs channel.` },
                        { name: `${client.emoji.arrow} ?ticket panel <channel>`, value: `Set the panel channel.` }
                    ),
            ],
        });
    }

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("etitle").setLabel("Title").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("edescription").setLabel("Description").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("eimage").setLabel("Image").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("efinish").setLabel("Save & Finish").setStyle(ButtonStyle.Success)
    );

    await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setDescription("Use the buttons below to configure your ticket panel embed.")
                .setColor(client.color),
        ],
        components: [buttons],
    });
}

// --- Logs Setup ---
async function setLogs(message, client, args) {
    let guildId = message.guild.id;
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

    if (!channel) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | No Channel mentioned to set for Logs`)
            ]
        });
    }

    await ticketSchema.findOneAndUpdate(
        { GuildId: guildId },
        { Logs: channel.id },
        { upsert: true }
    );

    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Channel set for Logs: ${channel}`)
        ]
    });
}

// --- Role Setup ---
async function setRole(message, client, args) {
    let guildId = message.guild.id;
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if (!role) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | No Role mentioned to set for Support Role`)
            ]
        });
    }

    await ticketSchema.findOneAndUpdate(
        { GuildId: guildId },
        { Role: role.id },
        { upsert: true }
    );

    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Support Staff Role set: ${role}`)
        ]
    });
}

// --- Panel Setup ---
async function setPanel(message, client, args) {
    let guildId = message.guild.id;
    const pchannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

    if (!pchannel) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | No Channel mentioned for Panel Embed`)
            ]
        });
    }

    await ticketSchema.findOneAndUpdate(
        { GuildId: guildId },
        { Channel: pchannel.id },
        { upsert: true }
    );

    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Panel Embed will be sent to: ${pchannel}`)
        ]
    });
}

// --- Category Setup ---
async function setCategory(message, client, args) {
    let guildId = message.guild.id;
    const categoryId = args[1];

    if (!categoryId) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | No category ID provided.`)
            ]
        });
    }

    // Check if the provided ID exists and is a Category channel
    const categoryChannel = message.guild.channels.cache.get(categoryId);
    if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | The ID provided is not a valid category.`)
            ]
        });
    }

    await ticketSchema.findOneAndUpdate(
        { GuildId: guildId },
        { Category: categoryId },
        { upsert: true }
    );

    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Ticket category set to <#${categoryId}>`)
        ]
    });
}


// --- Disable Ticket System ---
async function setDisable(message, client) {
    try {
        const guildId = message.guild.id;

        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await message.reply({
                content: `🚫 You are missing the **Administrator** permission to use this command.`
            });
        }

        const data = await ticketSchema.findOne({ GuildId: guildId });

        if (!data) {
            return await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription('Ticket System has already been disabled')
                ]
            });
        }

        await ticketSchema.findOneAndDelete({ GuildId: guildId });

        const channel = client.channels.cache.get(data.Channel);

        if (channel) {
            const messages = await channel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();
            if (lastMessage && lastMessage.author.id === client.user.id) {
                await lastMessage.delete();
            }
        }

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} | Ticket System has been disabled`)
            ]
        });
    } catch (err) {
        console.error(err);
    }
}
