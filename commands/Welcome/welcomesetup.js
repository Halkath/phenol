const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const WelcomeSetup = require("../../Schemas.js/welcomeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-setup")
        .setDescription("Setup the welcome system for the server.")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel To Send Welcome Greeting.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            // ✅ Permission check
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | You need **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }

            const guildId = interaction.guild.id;
            const channelId = interaction.options.getChannel("channel").id;

            const exist = await WelcomeSetup.findOne({ guildId });
            if (exist) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | Setup Exist ! Try \`/welcome test\``,
                    ephemeral: true
                });
            }

            await WelcomeSetup.create({ guildId, channelId });

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Welcome Setup Completed.\n${client.emoji.arrow} Added : <#${channelId}>.`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        } catch (error) {
            console.error("Error\n", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: `${client.emoji.cross} | Error ! While Executing Cmd`,
                    ephemeral: true
                });
            }
        }
    }
};
