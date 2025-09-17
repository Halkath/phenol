const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Change the nickname of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to rename')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nick')
                .setDescription('New nickname')
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const newNick = interaction.options.getString('nick');
        const member = await interaction.guild.members.fetch(user.id);

        // Check role in specific guild
        const requiredRoleId = '1139499146429091962';
        const specificGuildId = 'YOUR_GUILD_ID_HERE'; // replace with your guild ID

        const hasRoleOrPermission = interaction.guild.id === specificGuildId
            ? interaction.member.roles.cache.has(requiredRoleId)
            : interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames);

        if (!hasRoleOrPermission) {
            return interaction.reply({
                content: `❌ You do not have permission to change nicknames.`,
                ephemeral: true
            });
        }

        try {
            await member.setNickname(newNick, `Changed by ${interaction.user.tag}`);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setDescription(`✅ Changed nickname of **${user.tag}** to **${newNick}**`)
                ]
            });
        } catch (err) {
            await interaction.reply({
                content: `❌ Failed to change nickname: ${err.message}`,
                ephemeral: true
            });
        }
    }
};
