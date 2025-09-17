const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const joinrole = require('../../Schemas.js/autoroleSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinrole')
        .setDescription('Manage autoroles for new members')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a role to autorole list')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to add')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a role from autorole list')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear all autoroles')
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List current autoroles')
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({
                content: '❌ You need `Manage Roles` permission to use this command.',
                ephemeral: true
            });
        }

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const data = await joinrole.findOne({ GuildId: guildId }) || await joinrole.create({ GuildId: guildId, RoleIds: [] });

        if (sub === 'add') {
            const role = interaction.options.getRole('role');
            if (data.RoleIds.includes(role.id)) {
                return interaction.reply({ content: '⚠️ That role is already in the autorole list.', ephemeral: true });
            }

            data.RoleIds.push(role.id);
            await data.save();

            return interaction.reply({ content: `✅ Added ${role} to the autorole list.` });
        }

        if (sub === 'remove') {
            const role = interaction.options.getRole('role');
            if (!data.RoleIds.includes(role.id)) {
                return interaction.reply({ content: '⚠️ That role is not in the autorole list.', ephemeral: true });
            }

            data.RoleIds = data.RoleIds.filter(id => id !== role.id);
            await data.save();

            return interaction.reply({ content: `✅ Removed ${role} from the autorole list.` });
        }

        if (sub === 'clear') {
            data.RoleIds = [];
            await data.save();

            return interaction.reply({ content: '✅ Cleared all autoroles.' });
        }

        if (sub === 'list') {
            if (!data.RoleIds.length) {
                return interaction.reply({ content: '📭 No autoroles have been set.', ephemeral: true });
            }

            const roles = data.RoleIds.map(id => {
                const role = interaction.guild.roles.cache.get(id);
                return role ? `${role}` : `\`Unknown Role (ID: ${id})\``;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Autorole List')
                .setColor('Blue')
                .setDescription(roles)
                .setFooter({ text: interaction.guild.name })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
