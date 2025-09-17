const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-rename')
        .setDescription('Rename the ticket channel')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('New ticket channel name')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(50)
        ),

    async execute(interaction,client) {
        const newName = interaction.options.getString('name');

        if (!interaction.channel.name.startsWith('ticket-') && !interaction.channel.name.startsWith('reopened-')  && !interaction.channel.name.startsWith('closed-')) {
            return interaction.reply({ content: `${client.emoji.cross} | This is not a ticket channel.`, ephemeral: true });
        }

        try {
            await interaction.channel.setName(newName);
            return interaction.reply({ content: `${client.emoji.tick} | Channel renamed to \`${newName}\`.` });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: `${client.emoji.cross} | Could not rename the ticket.`, ephemeral: true });
        }
    }
};
