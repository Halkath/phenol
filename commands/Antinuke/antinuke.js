const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");

const antinukeSchema = require("../../Schemas.js/antinukeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("antinuke")
        .setDescription("Manage antinuke Protection for the server.")
        .addSubcommand(subcommand =>
            subcommand.setName("enable").setDescription("Enables anti-nuke protection for the Server.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("disable").setDescription("Disables anti-nuke protection for the Server.")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("status").setDescription("Check Status anti-nuke protection for the Server.")
        )
    .addSubcommand(subcommand =>
            subcommand
                .setName("log")
                .setDescription("Setup a log channel for antinuke events.")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("Select a text channel for logs")
                        .addChannelTypes(ChannelType.GuildText) // restrict to text channels
                        .setRequired(true)
                )
        )
        .addSubcommandGroup(group =>
            group.setName("whitelist")
                .setDescription("Whitelist user for anti-nuke protection for the Server.")
                .addSubcommand(subcommand =>
                    subcommand.setName("add")
                        .setDescription("Add User In Antinuke WhiteList List")
                        .addUserOption(option =>
                            option.setName("user")
                                .setDescription("Whitelist A User")
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName("remove")
                        .setDescription("Remove User From Antinuke WhiteList List")
                        .addUserOption(option =>
                            option.setName("user")
                                .setDescription("Un-Whitelist A User")
                                .setRequired(true)
                        )
                )
                            
                .addSubcommand(subcommand =>
                    subcommand.setName("list")
                        .setDescription("View User At Antinuke WhiteList List")
                )
        ),
    async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
  return interaction.reply({
    content: "No Access! Missing Administrator permission.",
    ephemeral: true
  });
}

        try {
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand();
        
            if (!group) {
                switch (sub) {
                    case "enable": return enableAntinuke(interaction, client);
                    case "disable": return disableAntinuke(interaction, client);
                    case "status": return checkAntinukeStatus(interaction, client);
                     case "log": return setupLogChannel(interaction, client);
                }
            } else if (group === "whitelist") {
                switch (sub) {
                    case "add": return addtoWhitelist(interaction, client);
                    case "remove": return removetoWhitelist(interaction, client);
                    case "list": return showWhitelistedUsers(interaction, client);
                }
            }
        } catch (error) {
            console.error("Error", error);
            return interaction.reply("An Error While Executing command");
        }
    }
};

async function enableAntinuke(interaction, client) {
    const existingHistory = await antinukeSchema.findOne({
        guildId: interaction.guild.id
    });
    if (existingHistory) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Status : ${client.emoji.tick}\n\n__Anti-nuke protection is Enabled For This Server__`)
                    .setFooter({ text: `Made By Sinux Devlopment` })
                    .setTimestamp()
            ]
        });
    }

    const setupMessage = await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`Status : <a:Sinux_Timer:1123988710673883136>\n\n__Setting Up Antinuke System...__`)
                .setFooter({ text: `Made By Sinux Devlopment` })
                .setTimestamp()
        ], fetchReply: true
    });

    try {
        const setupSteps = [
            'Anti-EmojiDelete',
            'Anti-StickerDelete',
            'Anti-kick',
            'Anti-Ban',
            'Anti-CannnelCreate**',
            'Anti-CannnelDelete**',
            'Anti-RoleUpdate**',
            'Anti-RoleCreate**',
            'Anti-RoleGive**',
            'Anti-RoleRemove**',
            'Anti-GuildUpdate**',
            'Anti-BanRemove**',
        ];
        let setupContent = `Status : <a:Sinux_Timer:1123988710673883136>\n\n__Setting Up Antinuke System...__\n\n`;
        for (const step of setupSteps) {
            setupContent += `${client.emoji.tick} : ${step}\n`;

            await setupMessage.edit({
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
            guildId: interaction.guild.id,
            whitelist: []
        });

       const embedMsg = new EmbedBuilder()
    .setTitle("Antinuke System Setup Completed")
    .setDescription("Antinuke Protection has been successfully enabled for this server.")
    .setColor("Green")
    .setTimestamp();

const LogMsg = new EmbedBuilder()
    .setColor(client.color)
    .setDescription(`⚠️ You can run \`/antinuke logs\` anytime to set a custom logs channel.`)
    .setTimestamp();

await setupMessage.edit({
    content: `Antinuke System Setup Completed.`,
    embeds: [embedMsg, LogMsg]
});

    } catch (error) {
        console.error("Error Setting up Antinuke System : ", error);
        return setupMessage.edit({
            content: `An Error !`
        });
    }
}

async function setupLogChannel(interaction, client) {
    const channel = interaction.options.getChannel("channel");
    let data = await antinukeSchema.findOne({ guildId: interaction.guild.id });
    if (!data) {
        data = new antinukeSchema({ guildId: interaction.guild.id });
    }

    data.logChannelId = channel.id;
    await data.save();

    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} Antinuke logs will now be sent in ${channel}`)
        ]
    });
}


async function disableAntinuke(interaction, client) {
    const existingEntry = await antinukeSchema.findOne({
        guildId: interaction.guild.id
    });
    if (!existingEntry) return interaction.reply({
        content: `> Status : ${client.emoji.cross}\n\n> __Anti-nuke protection is Not enabled For This Server__`
    });
    await antinukeSchema.findOneAndDelete({
        guildId: interaction.guild.id
    });
    return interaction.reply({
        content: `> Status : ${client.emoji.tick}\n\n> __Anti-nuke protection is Disabled For This Server__`
    });
}
async function checkAntinukeStatus(interaction, client) {
    const data = await antinukeSchema.findOne({ guildId: interaction.guild.id });
    const protections = [
        'Anti-EmojiDelete',
        'Anti-StickerDelete',
        'Anti-kick',
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
        const ch = interaction.guild.channels.cache.get(data.logChannelId);
        logChannelDisplay = ch ? `${ch}` : `Channel not found (deleted?)`;
    }
    description += `\n**Logs Channel:** ${logChannelDisplay}\n`;

    const embeed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Anti-nuke Protection Status")
        .setDescription(description.trim())
        .setTimestamp();

    return interaction.reply({
        embeds: [embeed]
    });
}
async function addtoWhitelist(interaction, client) {
    const user = interaction.options.getUser('user');
    const existingEntry = await antinukeSchema.findOne({
        guildId: interaction.guild.id
    });
    if (!existingEntry) return interaction.reply({
        content: `> Status : ${client.emoji.cross}\n\n> __Anti-nuke protection is Not enabled For This Server__`
    });
    if (existingEntry.whitelist.includes(user.id)) {
        return interaction.reply({
            content: `> Status : ${client.emoji.cross}\n\n> __User: ${user.tag}__\n> __User is Already Whitelisted For This Server__`
        });
    }
    existingEntry.whitelist.push(user.id);
    await existingEntry.save();
    return interaction.reply({
        content: `> Status : ${client.emoji.tick}\n\n> __User: ${user.tag}__\n> __User has been Whitelisted For This Server__`
    });
}

async function removetoWhitelist(interaction, client) {
    const user = interaction.options.getUser('user');
    const existingEntry = await antinukeSchema.findOne({
        guildId: interaction.guild.id
    });
    if (!existingEntry) return interaction.reply({
        content: `> Status : ${client.emoji.cross}\n\n> __Anti-nuke protection is Not enabled For This Server__`
    });
    if (!existingEntry.whitelist.includes(user.id)) {
        return interaction.reply({
            content: `> Status : ${client.emoji.cross}\n\n> __User: ${user.tag}__\n> __User is Not Whitelisted For This Server__`
        });
    }
    existingEntry.whitelist = existingEntry.whitelist.filter(id => id !== user.id);
    await existingEntry.save();
    return interaction.reply({
        content: `> Status : ${client.emoji.tick}\n\n> __User: ${user.tag}__\n> __User has been Un-Whitelisted For This Server__`
    });
}

async function showWhitelistedUsers(interaction, client) {
    const existingEntry = await antinukeSchema.findOne({
        guildId: interaction.guild.id
    });
    if (!existingEntry) return interaction.reply({
        content: `> Status : ${client.emoji.cross}\n\n> __Anti-nuke protection is Not enabled For This Server__`
    });
    if (existingEntry.whitelist.length === 0) {
        return interaction.reply("No Users !");
    }
    const WhitelistedUsers = await Promise.all(
        existingEntry.whitelist.map(async userId => {
            try {
                const user = await interaction.client.users.fetch(userId);
                return user.tag;
            } catch (error) {
                console.error("Error fetching user:", error);
                return "Unknown User";
            }
        })
    );
    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Whitelisted Users For This Server : ${WhitelistedUsers.join(', ')}`)
                .setFooter({ text: `Made By Sinux Devlopment` })
                .setTimestamp()
        ]
    });
}

