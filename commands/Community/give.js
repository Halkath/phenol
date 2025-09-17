const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("give")
        .setDescription("Provides or removes a role from a specific user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Select the user to modify role")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Select the role to give or remove")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const emojis = client.emoji || {}; // fallback to empty if undefined

        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2f3136")
                        .setDescription(`${emojis.cross || "❌"} You lack the \`Manage Roles\` permission.`)
                        .setTimestamp()
                ],
                ephemeral: true
            });
        }

        const member = interaction.options.getMember("user");
        const role = interaction.options.getRole("role");

        // Check if valid user/role
        if (!member || !role) {
            return await interaction.reply({
                content: `${emojis.cross || "❌"} Invalid user or role.`,
                ephemeral: true
            });
        }

        // User role hierarchy check
        if (interaction.member.roles.highest.position <= role.position && interaction.guild.ownerId !== interaction.user.id) {
            return await interaction.reply({
                content: `${emojis.cross || "❌"} You can't manage a role that is higher or equal to your highest role.`,
                ephemeral: true
            });
        }

        // Bot permission check
        const botMember = interaction.guild.members.me;
        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return await interaction.reply({
                content: `${emojis.cross || "❌"} I don't have permission to manage roles!`,
                ephemeral: true
            });
        }

        // Bot role hierarchy check
        if (role.position >= botMember.roles.highest.position) {
            return await interaction.reply({
                content: `${emojis.cross || "❌"} I can't manage that role because it's higher or equal to my highest role.`,
                ephemeral: true
            });
        }

        // Try to add/remove role
        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#2f3136")
                            .setDescription(`${emojis.cross || "🗑️"} Removed ${role} from ${member}.`)
                            .setTimestamp()
                    ]
                });
            } else {
                await member.roles.add(role);
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#2f3136")
                            .setDescription(`${emojis.tick || "✅"} Added ${role} to ${member}.`)
                            .setTimestamp()
                    ]
                });
            }
        } catch (err) {
            console.error(err);
            return await interaction.reply({
                content: `${emojis.cross || "❌"} Failed to update role. Make sure I have the right permissions and the role is manageable.`,
                ephemeral: true
            });
        }
    }
};
