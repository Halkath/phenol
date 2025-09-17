const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping") // ✅ lowercase
        .setDescription("Ping Command"),
    
    async execute(interaction) {
        await interaction.reply({ content: 'Pong!' });
    }
};
