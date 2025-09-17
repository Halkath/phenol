const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member for a specific duration with a reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Choose time type')
                .setRequired(true)
                .addChoices(
                    { name: 'Seconds', value: 's' },
                    { name: 'Minutes', value: 'm' },
                    { name: 'Hours', value: 'h' },
                    { name: 'Days', value: 'd' }
                )
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of selected time unit')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const timeType = interaction.options.getString('time'); // s, m, h, d
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
        if (!member.moderatable) return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: true });

        const unitMultipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        const maxTimeout = 28 * 24 * 60 * 60 * 1000; // 28 days
        const muteDuration = amount * unitMultipliers[timeType];

        if (!muteDuration || muteDuration <= 0 || muteDuration > maxTimeout) {
            return interaction.reply({
                content: `❌ Invalid duration. Must be greater than 0 and not more than 28 days.`,
                ephemeral: true
            });
        }

        // Attempt DM
        const dmEmbed = new EmbedBuilder()
            .setTitle('Muted from Server')
            .setDescription(`You have been muted in **${interaction.guild.name}** for **${amount} ${timeType}**\n**Reason:** ${reason}`)
            .setColor('Red');

        await user.send({ embeds: [dmEmbed] }).catch(() => { });

        // Apply mute
        await member.timeout(muteDuration, reason).catch(err => {
            return interaction.reply({ content: `❌ Failed to mute: ${err.message}`, ephemeral: true });
        });

        const replyEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`✅ **${user.tag}** has been muted for **${amount} ${timeType}**.\n**Reason:** ${reason}`);

        await interaction.reply({ embeds: [replyEmbed] });
    }
};
