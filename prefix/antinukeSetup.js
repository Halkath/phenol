const { PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const antinukeSchema = require("../../Schemas.js/antinukeSchema");

module.exports = {
    name: 'antinuke',
    description: 'System to stop the nukes',
    run: async (client, message, args) => {
        const subcommand = args[0];
        const existing = await antinukeSchema.findOne({ guildId: message.guild.id }); // ✅ Added await

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setFooter({ text: `Made By Sinux Development` });

        if (!subcommand) {
            return message.reply({
                embeds: [
                    embed.setDescription(`Usage: \`antinuke <enable | disable | status | logs | whitelist>\``)
                ]
            });
        }

        if (subcommand === "enable") {
            if (existing) {
                return message.reply({
                    embeds: [
                        embed.setDescription(`${client.emoji.cross} | Antinuke is already enabled in this server.`)
                    ]
                });
            }

            let setupContent = ""; // ✅ FIX: declare variable

            const setupMsg = await message.channel.send({
                embeds: [
                    embed.setDescription(`<a:Sinux_Timer:1123988710673883136> | Setting up Antinuke System...`).setTimestamp()
                ]
            });

            try {
                const setupSteps = [
                    '**Anti-EmojiDelete**',
                    '**Anti-StickerDelete**',
                    '**Anti-Kick**',
                    '**Anti-Ban**',
                    '**Anti-ChannelCreate**',
                    '**Anti-ChannelDelete**',
                    '**Anti-RoleUpdate**',
                    '**Anti-RoleCreate**',
                    '**Anti-RoleGive**',
                    '**Anti-RoleRemove**',
                    '**Anti-GuildUpdate**',
                    '**Anti-BanRemove**',
                ];

                for (const step of setupSteps) {
                    setupContent += `${client.emoji.tick} : ${step}\n`;

                    await setupMsg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(setupContent)
                                .setColor(client.color)
                                .setTimestamp()
                        ]
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                await antinukeSchema.create({
                    guildId: message.guild.id,
                    whitelist: []
                });

                const embedMsg = new EmbedBuilder()
                    .setTitle("Antinuke System Setup Completed")
                    .setDescription("Antinuke Protection has been successfully enabled for this server.")
                    .setColor("Green")
                    .setTimestamp();

                const logMsg = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | You can run \`antinuke logs #channel\` anytime to set a custom logs channel.`)
                    .setTimestamp();

                await setupMsg.edit({
                    content: `${client.emoji.tick} Antinuke System Setup Completed.`,
                    embeds: [embedMsg, logMsg]
                });
            } catch (error) {
                console.error("Error setting up Antinuke System: ", error);
                return setupMsg.edit({
                    content: `${client.emoji.cross} An Error occurred while setting up Antinuke!`
                });
            }
        }

        else if (subcommand === "logs") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply(`${client.emoji.cross} Mention a channel to log Antinuke actions!`);
            return setupLogChannel(channel, client, message);
        }

        else if (subcommand === "disable") {
            return disableAntinuke(client, message);
        }

        else if (subcommand === "status") {
            return checkAntinukeStatus(client, message);
        }

        else if (subcommand === "whitelist" || subcommand === "wl") {
            const decide = args[1];
            if (!decide) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setTitle("Whitelist Commands")
                            .addFields(
                                { name: `antinuke whitelist add @user`, value: `Add a user to whitelist`, inline: false },
                                { name: `antinuke whitelist remove @user`, value: `Remove a user from whitelist`, inline: false },
                                { name: `antinuke whitelist list`, value: `Show whitelisted users`, inline: false },
                            )
                            .setTimestamp()
                    ]
                });
            }

            if (decide === "add") {
                const user = message.mentions.members.first() || message.guild.members.cache.get(args[2]);
                if (!user) return message.reply(`${client.emoji.cross} Mention a user to whitelist!`);
                return addtoWhitelist(client, user, message);
            }

            else if (decide === "remove") {
                const user = message.mentions.members.first() || message.guild.members.cache.get(args[2]);
                if (!user) return message.reply(`${client.emoji.cross} Mention a user to remove from whitelist!`);
                return removetoWhitelist(user, message, client);
            }

            else if (decide === "list") {
                return showWhitelistedUsers(message, client);
            }
        }
    },
};

// ✅ Helper Functions
async function setupLogChannel(channel, client, message) {
    let data = await antinukeSchema.findOne({ guildId: message.guild.id });
    if (!data) {
        data = new antinukeSchema({ guildId: message.guild.id, whitelist: [] });
    }

    data.logChannelId = channel.id;
    await data.save();

    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Antinuke logs will now be sent in ${channel}`)
        ]
    });
}

async function disableAntinuke(client, message) {
    const existingEntry = await antinukeSchema.findOne({ guildId: message.guild.id });
    if (!existingEntry) {
        return message.reply({
            content: `> ${client.emoji.cross} | Antinuke protection is not enabled for this server.`
        });
    }

    await antinukeSchema.findOneAndDelete({ guildId: message.guild.id });

    return message.reply({
        content: `> ${client.emoji.tick} | Antinuke protection has been disabled for this server.`
    });
}

async function checkAntinukeStatus(client, message) {
    const data = await antinukeSchema.findOne({ guildId: message.guild.id });
    const protections = [
        'Anti-EmojiDelete',
        'Anti-StickerDelete',
        'Anti-Kick',
        'Anti-Ban',
        'Anti-ChannelCreate',
        'Anti-ChannelDelete',
        'Anti-RoleUpdate',
        'Anti-RoleCreate',
        'Anti-RoleGive',
        'Anti-RoleRemove',
        'Anti-GuildUpdate',
        'Anti-BanRemove',
    ];

    let description = "";
    protections.forEach(protection => {
        const status = data ? `${client.emoji.tick}` : `${client.emoji.cross}`;
        description += `**${status} : ${protection}**\n`;
    });

    let logChannelDisplay = "Not set.";
    if (data && data.logChannelId) {
        const ch = message.guild.channels.cache.get(data.logChannelId);
        logChannelDisplay = ch ? `${ch}` : `Channel not found (deleted?)`;
    }
    description += `\n**Logs Channel:** ${logChannelDisplay}\n`;

    const embed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Antinuke Protection Status")
        .setDescription(description.trim())
        .setTimestamp();

    return message.reply({ embeds: [embed] });
}

async function addtoWhitelist(client, user, message) {
    const existingEntry = await antinukeSchema.findOne({ guildId: message.guild.id });
    if (!existingEntry) {
        return message.reply({
            content: `> ${client.emoji.cross} | Antinuke protection is not enabled for this server`
        });
    }

    if (existingEntry.whitelist.includes(user.id)) {
        return message.reply({
            content: `> ${client.emoji.cross} | User: ${user.user.tag}\n> User is already whitelisted`
        });
    }

    existingEntry.whitelist.push(user.id);
    await existingEntry.save();

    return message.reply({
        content: `> ${client.emoji.tick} | User: ${user.user.tag}\n> User has been whitelisted`
    });
}

async function removetoWhitelist(user, message, client) {
    const existingEntry = await antinukeSchema.findOne({ guildId: message.guild.id });
    if (!existingEntry) {
        return message.reply({
            content: `> ${client.emoji.cross} | Antinuke protection is not enabled for this server`
        });
    }

    if (!existingEntry.whitelist.includes(user.id)) {
        return message.reply({
            content: `> ${client.emoji.cross} | User: ${user.user.tag}\n> User is not whitelisted`
        });
    }

    existingEntry.whitelist = existingEntry.whitelist.filter(id => id !== user.id);
    await existingEntry.save();

    return message.reply({
        content: `> ${client.emoji.tick} | User: ${user.user.tag}\n> User has been removed from whitelist`
    });
}

async function showWhitelistedUsers(message, client) {
    const existingEntry = await antinukeSchema.findOne({ guildId: message.guild.id });
    if (!existingEntry) {
        return message.reply({
            content: `> ${client.emoji.cross} | Antinuke protection is not enabled for this server`
        });
    }

    if (existingEntry.whitelist.length === 0) {
        return message.reply(`${client.emoji.cross} No users are whitelisted.`);
    }

    const WhitelistedUsers = await Promise.all(
        existingEntry.whitelist.map(async userId => {
            try {
                const user = await message.client.users.fetch(userId);
                return user.tag;
            } catch {
                return "Unknown User";
            }
        })
    );

    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setTitle("Whitelisted Users")
                .setDescription(WhitelistedUsers.join(', '))
                .setFooter({ text: `Made By Sinux Development` })
                .setTimestamp()
        ]
    });
}
