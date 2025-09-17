const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const voiceSchema = require("../../Schemas.js/jointocreate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join-to-create')
        .setDescription("Setup and disable your join-to-create system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command =>
            command.setName("setup")
                .setDescription("Setup your join-to-create system.")
                .addChannelOption(option =>
                    option.setName("channel")
                        .setDescription("The join-to-create voice channel.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice)
                )
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription("Category for new VCs.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
                .addIntegerOption(option =>
                    option.setName("voice-limit")
                        .setDescription("Default limit for new voice channels.")
                        .setMinValue(2)
                        .setMaxValue(20)
                        .setRequired(false)
                )
        )
        .addSubcommand(command =>
            command.setName('disable')
                .setDescription("Disable your join-to-create voice channels.")
        ),

    async execute(interaction) {
        const data = await voiceSchema.findOne({ Guild: interaction.guild.id });
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'setup': {
                if (data) {
                    return interaction.reply({
                        content: `❌ You already have a join-to-create system setup.`,
                        ephemeral: true
                    });
                }

                const channel = interaction.options.getChannel('channel');
                const category = interaction.options.getChannel('category');
                const limit = interaction.options.getInteger("voice-limit") || 4;

                await voiceSchema.create({
                    Guild: interaction.guild.id,
                    Channel: channel.id,
                    Category: category.id,
                    VoiceLimit: limit
                });
                const panel = new EmbedBuilder()
                .setDescription("Enjoy Quality Time At Pvt Voice Channel.")
                .setColor(client.color)
                const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("lock Vc")
                    .setCustomId("lockv")
                )
                const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Unlock Vc")
                    .setCustomId('unlockv')
                    
                )
                const newChannel = await guild.channels.create({
                    name: "manage-vc",
                    type: ChannelType.GuildText, // For a text channel, or ChannelType.GuildVoice, etc.
                    parent: category,          // Optional, for category nesting
                    topic: "Create a interaction based channel for vc",      // Optional
                    permissionOverwrites: [
                        {
                            id: interaction.user.id, // The user's ID
                            allow: [PermissionsBitField.Flags.ViewChannel],
                            deny: [PermissionsBitField.Flags.SendMessages]
                        },
                    ]
                });
  
                await newChannel.send({
                    content: "Welcome! Use the buttons below to manage your voice channel.",
                    embeds: [panel],           // If 'panel' is your EmbedBuilder object
                    components: [row1, row2] // If row1/row2/row3 are your ActionRowBuilder objects with buttons
                });
                const embed = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription(`✅ Join-to-create system setup!\n**Join Channel:** ${channel}\n**Category:** ${category}\n**Limit:** ${limit} users`);

                return interaction.reply({
                    content: `<@${interaction.user.id}>`,
                    embeds: [embed]
                });
            }

            case "disable": {
                if (!data) {
                    return interaction.reply({
                        content: `❌ You do not have the join-to-create system setup.`,
                        ephemeral: true
                    });
                }

                await voiceSchema.deleteMany({ Guild: interaction.guild.id });

                const embed2 = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription("🛑 The join-to-create system has been disabled.");

                return interaction.reply({
                    content: `<@${interaction.user.id}>`,
                    embeds: [embed2]
                });
            }
        }
    }
};
