const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a muted user with a reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmuting the user')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
        }

        if (!member.communicationDisabledUntil) {
            return interaction.reply({ content: '❌ This user is not currently muted.', ephemeral: true });
        }

        // Attempt DM
        const dmEmbed = new EmbedBuilder()
            .setTitle('Unmuted')
            .setDescription(`You have been **unmuted** in **${interaction.guild.name}**\n**Reason:** ${reason}`)
            .setColor('Green');

        await user.send({ embeds: [dmEmbed] }).catch(() => { });

        // Remove timeout
        await member.timeout(null, reason).catch(err => {
            return interaction.reply({ content: `❌ Failed to unmute: ${err.message}`, ephemeral: true });
        });

        const replyEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`✅ **${user.tag}** has been unmuted.\n**Reason:** ${reason}`);

        await interaction.reply({ embeds: [replyEmbed] });
    }
};
