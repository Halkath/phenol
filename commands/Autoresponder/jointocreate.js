const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
    PermissionsBitField,
} = require("discord.js");
const voiceSchema = require("../../Schemas.js/jointocreate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("temp-vc")
        .setDescription("Setup and disable your join-to-create system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command =>
            command
                .setName("setup")
                .setDescription("Setup your join-to-create system.")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The join-to-create voice channel.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice)
                )
                .addChannelOption(option =>
                    option
                        .setName("category")
                        .setDescription("Category for new VCs.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
                .addIntegerOption(option =>
                    option
                        .setName("voice-limit")
                        .setDescription("Default limit for new voice channels.")
                        .setMinValue(2)
                        .setMaxValue(20)
                        .setRequired(false)
                )
        )
        .addSubcommand(command =>
            command.setName("disable").setDescription("Disable your join-to-create voice channels.")
        ),
    async execute(interaction, client) {
        const data = await voiceSchema.findOne({ Guild: interaction.guild.id });
        const sub = interaction.options.getSubcommand();

        if (sub === "setup") {
            if (data) {
                return interaction.reply({
                    content: `${client.emoji?.cross || "❌"} | You already have a join-to-create system setup.`,
                    ephemeral: true,
                });
            }
            const channel = interaction.options.getChannel("channel");
            const category = interaction.options.getChannel("category");
            const limit = interaction.options.getInteger("voice-limit") || 4;

            const panel = new EmbedBuilder()
                .setColor(client.color || "Random")
                .setDescription("🎙️ Enjoy Quality Time At Pvt Voice Channel.")
                .addFields(
                    { name: "Lock Vc", value: "Locks Your Own VC" },
                    { name: "Unlock Vc", value: "Unlocks Your Own VC" },
                    { name: "Hide Vc", value: "Hides Your Own VC" },
                    { name: "Unhide Vc", value: "Unhides Your Own VC" }
                );

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel("Lock VC").setCustomId("lockv"),
                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel("Unlock VC").setCustomId("unlockv"),
                new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel("Hide VC").setCustomId("hidev"),
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel("Unhide VC").setCustomId("unhidev"),
                new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel("Limit VC").setCustomId("limitv")
            );

            const guild = interaction.guild;
            const newChannel = await guild.channels.create({
                name: "manage-vc",
                type: ChannelType.GuildText,
                parent: category,
                topic: "**__Create an interaction based channel for VC__**",
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AddReactions,
                        ],
                    },
                ],
            });
            const sentMessage = await newChannel.send({
                content: "Welcome! Use the buttons below to manage your voice channel.",
                embeds: [panel],
                components: [row1],
            });
            // Save temp created channel IDs for robust cleanup
            await voiceSchema.create({
                Guild: interaction.guild.id,
                Channel: channel.id,
                Category: category.id,
                VoiceLimit: limit,
                MessageId: sentMessage.id,
                ManageChannelId: newChannel.id, // <--- store manage-vc channel id
                TempChannels: [], // <--- store temp VC ids later if needed
            });
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`${client.emoji?.tick || "✅"} | Join-to-create system setup!`)
                .setDescription(
                    `**Join Channel:** ${channel}\n**Category:** ${category}\n**Limit:** ${limit} users`
                );
            return interaction.reply({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
            });
        }

        if (sub === "disable") {
            if (!data) {
                return interaction.reply({
                    content: `❌ You do not have the join-to-create system setup.`,
                    ephemeral: true,
                });
            }

            // Delete the manage-vc text channel
            const manageVcChannel = interaction.guild.channels.cache.get(data.ManageChannelId);
            if (manageVcChannel) {
                await manageVcChannel.delete().catch(() => {});
            }

            // Delete any remaining temp VCs if stored
            if (data.TempChannels && Array.isArray(data.TempChannels)) {
                for(const vcId of data.TempChannels) {
                    const tempVc = interaction.guild.channels.cache.get(vcId);
                    // Only delete if exists and is empty
                    if(tempVc && tempVc.members.size === 0) {
                        await tempVc.delete().catch(() => {});
                    }
                }
            }

            await voiceSchema.deleteMany({ Guild: interaction.guild.id });

            const embed2 = new EmbedBuilder()
                .setColor("Random")
                .setDescription(
                    `${client.emoji?.cross || "❌"} | The join-to-create system has been disabled and all related channels deleted.`
                );
            return interaction.reply({
                content: `<@${interaction.user.id}>`,
                embeds: [embed2],
            });
        }
    },
};
