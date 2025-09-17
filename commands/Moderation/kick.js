const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ComponentType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select the user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Specify the reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const userToKick = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const memberToKick = await interaction.guild.members.fetch(userToKick.id).catch(() => null);

        if (!memberToKick) {
            return interaction.reply({
                content: `❌ The user is not in this server.`,
                ephemeral: true
            });
        }

        if (!memberToKick.kickable) {
            return interaction.reply({
                content: `❌ I can't kick this user. They may have a higher role or I'm missing permissions.`,
                ephemeral: true
            });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_kick')
                .setLabel('✅ Confirm')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_kick')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

        const confirmEmbed = new EmbedBuilder()
            .setTitle('Kick Confirmation')
            .setDescription(`Are you sure you want to kick ${userToKick.tag}?\n**Reason:** ${reason}`)
            .setColor('Yellow');

        const response = await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true,
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000
        });

        collector.on('collect', async (btn) => {
            if (btn.user.id !== interaction.user.id)
                return btn.reply({ content: `⛔ Only <@${interaction.user.id}> can confirm this.`, ephemeral: true });

            await btn.deferUpdate();

            // Disable buttons
            confirmRow.components.forEach(button => button.setDisabled(true));
            await interaction.editReply({ components: [confirmRow] });

            if (btn.customId === 'confirm_kick') {
                // DM the user
                const dmEmbed = new EmbedBuilder()
                    .setTitle('You have been kicked')
                    .setDescription(`You were kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`)
                    .setColor('Red')
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    });

                await userToKick.send({ embeds: [dmEmbed] }).catch(() => { });

                await memberToKick.kick(reason);

                const successEmbed = new EmbedBuilder()
                    .setDescription(`✅ **${userToKick.tag}** has been kicked.\n**Reason:** ${reason}`)
                    .setColor('Green');

                await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
            } else if (btn.customId === 'cancel_kick') {
                await interaction.followUp({
                    content: '❌ Kick cancelled.',
                    ephemeral: true
                });
            }

            collector.stop();
        });

        collector.on('end', async () => {
            if (!interaction.ephemeral) return;
            // Disable buttons if user never interacted
            confirmRow.components.forEach(button => button.setDisabled(true));
            await interaction.editReply({ components: [confirmRow] }).catch(() => {});
        });
    }
};
