const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const reactionSchema = require('../../Schemas.js/reactionroleSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-roles')
        .setDescription('Manage your reaction roles system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a reaction role')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('The message ID to add the reaction role to')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('The emoji to trigger the role (use exact Discord emoji format)')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to give when the emoji is reacted')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a specific reaction role')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('The message ID')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('The emoji associated with the role (exact format)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all reaction roles for a message')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('The message ID')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const { guild } = interaction;

        // Permissions check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return await interaction.reply({
                content: '❌ You need `Manage Roles` permission to use this command.',
                ephemeral: true
            });
        }

        if (sub === 'add') {
            const messageId = interaction.options.getString('message-id');
            const emoji = interaction.options.getString('emoji');
            const role = interaction.options.getRole('role');

            const exists = await reactionSchema.findOne({
                Guild: guild.id,
                Message: messageId,
                Emoji: emoji
            });

            if (exists) {
                return await interaction.reply({
                    content: '❌ This reaction role already exists for this emoji on the message.',
                    ephemeral: true
                });
            }

            await reactionSchema.create({
                Guild: guild.id,
                Message: messageId,
                Emoji: emoji,
                Role: role.id
            });

            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Reaction Role Added")
                    .setDescription(`Message ID: \`${messageId}\`\nEmoji: ${emoji}\nRole: ${role}`)],
                ephemeral: true
            });
        }

        if (sub === 'remove') {
            const messageId = interaction.options.getString('message-id');
            const emoji = interaction.options.getString('emoji');

            const deleted = await reactionSchema.findOneAndDelete({
                Guild: guild.id,
                Message: messageId,
                Emoji: emoji
            });

            if (!deleted) {
                return await interaction.reply({
                    content: '❌ No reaction role found with that emoji for this message.',
                    ephemeral: true
                });
            }

            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🗑️ Reaction Role Removed")
                    .setDescription(`Message ID: \`${messageId}\`\nEmoji: ${emoji}`)],
                ephemeral: true
            });
        }

        if (sub === 'clear') {
            const messageId = interaction.options.getString('message-id');

            const result = await reactionSchema.deleteMany({
                Guild: guild.id,
                Message: messageId
            });

            if (result.deletedCount === 0) {
                return await interaction.reply({
                    content: '❌ No reaction roles found for that message.',
                    ephemeral: true
                });
            }

            return await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("🧹 Reaction Roles Cleared")
                    .setDescription(`Message ID: \`${messageId}\`\nCleared ${result.deletedCount} reaction roles.`)],
                ephemeral: true
            });
        }
    }
};
