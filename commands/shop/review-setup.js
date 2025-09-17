const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const reviewSchema = require("../../Schemas.js/reviewSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review-setup')
        .setDescription("Creates a Review System")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select a text channel for review submissions')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#2f3136")
            .setFooter({ text: `Made By Sinux Development` });

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `🚫 You are missing the **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }

            const revChannel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;

            const existingData = await reviewSchema.findOne({ Guild: guildId });

            if (existingData) {
                const existingChannel = interaction.guild.channels.cache.get(existingData.Channel);
                return await interaction.reply({
                    content: `🚫 Review system is already set up in ${existingChannel ? `<#${existingChannel.id}>` : 'an unknown channel'}.`,
                    ephemeral: true
                });
            }

            await reviewSchema.create({
                Guild: guildId,
                Channel: revChannel.id,
                Count: 0 // optional: initialize review count
            });

            embed.setDescription(`✅ Review system setup successfully!\nAll reviews will be sent to <#${revChannel.id}>`);
            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            embed.setDescription("❌ An error occurred while setting up the review system.");
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
