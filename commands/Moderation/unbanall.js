const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

const owners = ['233333']; // Replace with actual bot owner IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unbanall')
    .setDescription('Unbans all banned users from the server (Owner Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const executorId = interaction.user.id;

    if (!owners.includes(executorId)) {
      return await interaction.reply({
        content: `❌ You are not authorized to use this command.`,
        ephemeral: true
      });
    }

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      return await interaction.reply({
        content: '🔓 There are no banned users to unban.',
        ephemeral: true
      });
    }

    let unbannedCount = 0;

    for (const [userId, banInfo] of bans) {
      try {
        await interaction.guild.members.unban(userId, 'Mass unban by bot owner');
        unbannedCount++;
      } catch (err) {
        console.warn(`Failed to unban ${userId}:`, err.message);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🔓 Mass Unban Completed')
      .setDescription(`Successfully unbanned **${unbannedCount}** user(s).`)
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
