const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('Remove a user from this ticket channel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const channel = interaction.channel;

        // Validate ticket channel
        if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('claimed-')) {
            return interaction.reply({ content: `${client.emoji.cross} | This is not a ticket channel.`, ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false,
            });

            return interaction.reply({ content: `${client.emoji.tick} | <@${user.id}> has been removed from the ticket.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `${client.emoji.cross} | Failed to remove user from the ticket.`, ephemeral: true });
        }
    }
};
