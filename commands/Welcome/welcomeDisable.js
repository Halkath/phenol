const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const WelcomeSetup = require("../../Schemas.js/welcomeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-disable")
        .setDescription("Disable the welcome system for the server."),
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
            const exist = await WelcomeSetup.findOneAndDelete({ guildId });

            if (!exist) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | Setup Dosen't Exist ! Try \`/welcome setup\` first.`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Welcome Disabled Successfully.`)
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
