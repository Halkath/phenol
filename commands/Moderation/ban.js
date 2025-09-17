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
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for banning the user')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: `❌ The user is not in this server.`,
                ephemeral: true
            });
        }

        if (!member.bannable) {
            return interaction.reply({
                content: `❌ I can't ban this user. They may have a higher role or I'm missing permissions.`,
                ephemeral: true
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_ban')
                .setLabel('✅ Confirm')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_ban')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

        const confirmEmbed = new EmbedBuilder()
            .setTitle('Ban Confirmation')
            .setDescription(`Are you sure you want to ban **${targetUser.tag}**?\n**Reason:** ${reason}`)
            .setColor('Yellow');

        const replyMessage = await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000
        });

        collector.on('collect', async (btn) => {
            if (btn.user.id !== interaction.user.id)
                return btn.reply({ content: `⛔ Only you can confirm this ban.`, ephemeral: true });

            await btn.deferUpdate();

            // Disable buttons
            row.components.forEach(btn => btn.setDisabled(true));
            await interaction.editReply({ components: [row] });

            if (btn.customId === 'confirm_ban') {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('You have been banned')
                    .setDescription(`You were banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`)
                    .setColor('Red')
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    });

                await targetUser.send({ embeds: [dmEmbed] }).catch(() => { });

                await member.ban({ reason });

                const successEmbed = new EmbedBuilder()
                    .setDescription(`✅ **${targetUser.tag}** has been banned.\n**Reason:** ${reason}`)
                    .setColor('Green');

                await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
            } else if (btn.customId === 'cancel_ban') {
                await interaction.followUp({
                    content: '❌ Ban cancelled.',
                    ephemeral: true
                });
            }

            collector.stop();
        });

        collector.on('end', async () => {
            row.components.forEach(btn => btn.setDisabled(true));
            await interaction.editReply({ components: [row] }).catch(() => {});
        });
    }
};
