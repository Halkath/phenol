const {
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');
const schema = require('../../Schemas.js/autoresponder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoresponse')
        .setDescription('Manages Auto Responder')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create an auto responder')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('What triggers the auto response')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("response")
                        .setDescription(`What should be the response`)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an auto responder')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('Trigger to delete')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete-all')
                .setDescription('Deletes all auto responders')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all auto responders')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'create') {
            const trigger = interaction.options.getString('trigger');
            const response = interaction.options.getString('response');

            let data = await schema.findOne({ guildId });

            if (!data) {
                data = await schema.create({
                    guildId,
                    autoresponses: [{ trigger, response }]
                });
            } else {
                if (data.autoresponses.find(r => r.trigger === trigger)) {
                    return await interaction.reply({
                        content: `❌ This trigger already exists. Use a unique trigger.`,
                        ephemeral: true
                    });
                }
                data.autoresponses.push({ trigger, response });
                await data.save();
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Auto Responder Created')
                .setDescription(`**Trigger:** ${trigger}\n**Response:** ${response}`)
                .setColor('Green')
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'delete') {
            const trigger = interaction.options.getString('trigger');
            const data = await schema.findOne({ guildId });

            if (!data || !data.autoresponses.length) {
                return await interaction.reply({ content: `❌ No auto responders found.`, ephemeral: true });
            }

            const updated = data.autoresponses.filter(r => r.trigger !== trigger);

            if (updated.length === data.autoresponses.length) {
                return await interaction.reply({ content: `❌ No auto responder found with that trigger.`, ephemeral: true });
            }

            data.autoresponses = updated;
            await data.save();

            return await interaction.reply({ content: `✅ Auto responder with trigger \`${trigger}\` deleted.` });
        }

        if (subcommand === 'delete-all') {
            const data = await schema.findOne({ guildId });

            if (!data || !data.autoresponses.length) {
                return await interaction.reply({ content: `❌ No auto responders to delete.`, ephemeral: true });
            }

            data.autoresponses = [];
            await data.save();

            return await interaction.reply({ content: `✅ All auto responders have been deleted.` });
        }

        if (subcommand === 'list') {
            const data = await schema.findOne({ guildId });

            if (!data || !data.autoresponses.length) {
                return await interaction.reply({ content: `📭 No auto responders set.`, ephemeral: true });
            }

            const list = data.autoresponses
                .map((r, i) => `\`${i + 1}.\` **${r.trigger}** ➜ ${r.response}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle('📋 Auto Responders')
                .setDescription(list)
                .setColor('Blue');

            return await interaction.reply({ embeds: [embed] });
        }
    }
};
