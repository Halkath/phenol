const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('Add a user to this ticket channel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add')
                .setRequired(true)
        ),

    async execute(interaction,client) {
        const user = interaction.options.getUser('user');
        const channel = interaction.channel;

        // Validate ticket channel
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('claimed-') && !channel.name.startsWith('closed-')) {
            return interaction.reply({ content: `${client.emoji.cross} | This is not a ticket channel.`, ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });

            return interaction.reply({ content: `<@${user.id}>`,embeds: [
                new EmbedBuilder()
                .setDescription(client.emoji.tick +` | Added Successfully`)
            ] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `${client.emoji.cross} | Failed to add user to the ticket.`, ephemeral: true });
        }
    }
};
