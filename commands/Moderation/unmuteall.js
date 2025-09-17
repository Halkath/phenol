const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const owners = ['233333']; // Replace with actual owner IDs

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmuteall')
        .setDescription('Unmute all currently muted members in the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(interaction) {
        if (!owners.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You are not authorized to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const members = await interaction.guild.members.fetch();
        let unmutedCount = 0;

        for (const [_, member] of members) {
            if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
                try {
                    await member.timeout(null, 'Unmuted via /unmuteall');
                    unmutedCount++;
                } catch (err) {
                    console.error(`Failed to unmute ${member.user.tag}: ${err.message}`);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🔊 Unmute All')
            .setDescription(`Successfully unmuted **${unmutedCount}** member(s).`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
