const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../Schemas.js/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription("AFK system within the server")
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set yourself as AFK')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription("Reason for going AFK")
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const { options, guild, user } = interaction;
        const sub = options.getSubcommand();

        const existing = await afkSchema.findOne({
            Guild: guild.id,
            User: user.id
        });

        if (sub === 'set') {
            if (existing) {
                return await interaction.reply({
                    content: `❌ You are already marked as AFK in this server.`,
                    ephemeral: true
                });
            }

            const message = options.getString('message') || "I'm AFK";

            await afkSchema.create({
                Guild: guild.id,
                User: user.id,
                Message: message
            });

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`✅ You are now marked as AFK.\n💬 Reason: **${message}**`);

            await interaction.reply({ embeds: [embed] });
        }
    },
};
