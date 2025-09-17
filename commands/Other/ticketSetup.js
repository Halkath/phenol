const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const ticketSchema = require("../../Schemas.js/ticketSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription("Creates A Ticket System")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Setup in given channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Category for ticket')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Ticket support role')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('ticket-logs')
                .setDescription('Channel to send transcripts')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Content in the embed')
                .setRequired(false)
                .setMinLength(1)
                .setMaxLength(1000)
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color of the embed')
                .addChoices(
                    { name: 'Red', value: 'Red' },
                    { name: 'Blue', value: 'Blue' },
                    { name: 'Yellow', value: 'Yellow' },
                    { name: 'Green', value: 'Green' },
                    { name: 'Dark Black', value: '#2f3136' },
                    { name: 'Orange', value: 'Orange' }
                )
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title in the embed')
                .setRequired(false)
                .setMinLength(1)
                .setMaxLength(1000)
        ),

    async execute(interaction, client) {
        try {
            const { options, guild } = interaction;
            const color = options.getString('color') || client.color;
            const msg = options.getString("description") || '➜ **__Click On The Below Button To Create A Ticket__**.\n➜ **__A Ticket Should Be Opened Only For A Legit Reason.__**';
            const titlemsg = options.getString("title") || `${guild.name}'s Ticket System`;
            const GuildId = interaction.guild.id;
            const panel = options.getChannel("channel");
            const category = options.getChannel("category");
            const role = options.getRole("role");
            const logs = options.getChannel("ticket-logs");

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `${client.emoji.cross} You are missing the **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }

            const existing = await ticketSchema.findOne({ GuildId: GuildId });
            if (existing) {
                return await interaction.reply({
                    content: `⚠️ This guild already has a ticket panel setup.`,
                    ephemeral: true
                });
            }

            await ticketSchema.create({
                GuildId: GuildId,
                Channel: panel.id,
                Category: category.id,
                Role: role.id,
                Logs: logs.id
            });

            const ticketEmbed = new EmbedBuilder()
                .setTitle(titlemsg)
                .setDescription(msg)
                .setColor(color)
                .setFooter({
                    text: `Made by Sinux Devlopment 💗`,
                    iconURL: `https://cdn.discordapp.com/avatars/1038755954772152400/7086f4ab07a7c9f658165dc84a3c3443.webp?size=2048`
                });

            const btn = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Create Ticket')
                    .setCustomId('ticket')
                    .setStyle(ButtonStyle.Primary)
            );

            const channel = client.channels.cache.get(panel.id);
            await channel.send({ embeds: [ticketEmbed], components: [btn] });

            await interaction.reply({
                content: `✅ Ticket panel successfully sent to ${channel}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ An error occurred while setting up the ticket system.`,
                ephemeral: true
            });
        }
    }
};
