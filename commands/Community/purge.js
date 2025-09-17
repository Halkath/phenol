const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a specific number of messages from the channel')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Specify amount to purge')
                .setMinValue(1)
                .setMaxValue(99) // Max should be 99 due to Discord bulk delete limitations
                .setRequired(true)
        ),

    async execute(interaction) {
        const yes = `<:sinux_correct:1348307382043938857>`;
        const no = `<:Sinux_wrong:1274571568529412159>`;

        const embed = new EmbedBuilder()
            .setColor('#2f3136') // You can customize the color
            .setFooter({ text: `Made By Sinux Development` });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            embed.setDescription(`${no} | Missing \`Manage Messages\` permission.`);
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true); // true = filter messages older than 14 days

            embed.setDescription(`${yes} | Successfully deleted **${deleted.size}** messages.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
            embed.setDescription(`${no} | Failed to delete messages. Make sure they are not older than 14 days.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
