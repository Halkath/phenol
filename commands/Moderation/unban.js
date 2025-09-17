const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unbanning the user')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason');

    try {
      const bannedUsers = await interaction.guild.bans.fetch();

      const bannedUser = bannedUsers.get(userId);
      if (!bannedUser) {
        return await interaction.reply({
          content: `❌ User with ID \`${userId}\` is not banned.`,
          ephemeral: true
        });
      }

      await interaction.guild.members.unban(userId, reason);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🔓 User Unbanned')
        .setDescription(`Successfully unbanned <@${userId}> (\`${userId}\`)`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Unbanned by', value: `<@${interaction.user.id}>` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return await interaction.reply({
        content: `❌ Failed to unban user. Make sure the ID is correct and I have permissions.`,
        ephemeral: true
      });
    }
  }
};
