const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveall")
        .setDescription("Gives or removes a role from everyone/humans/bots")
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Select the role to give or remove")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("to")
                .setDescription("Choose whom to apply the role to")
                .setRequired(true)
                .addChoices(
                    { name: "Everyone", value: "everyone" },
                    { name: "Humans Only", value: "humans" },
                    { name: "Bots Only", value: "bots" }
                )
        ),

    async execute(interaction) {
        const { guild, member, options } = interaction;
        const role = options.getRole("role");
        const to = options.getString("to");

        // Permissions check
        if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return await interaction.reply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ You need `Manage Roles` permission.")],
                ephemeral: true
            });
        }

        const botMember = guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return await interaction.reply({
                content: "❌ I don't have permission to manage roles!",
                ephemeral: true
            });
        }

        if (role.position >= botMember.roles.highest.position) {
            return await interaction.reply({
                content: "❌ I can't manage that role because it's higher or equal to my highest role.",
                ephemeral: true
            });
        }

        await interaction.reply({ content: `⏳ Processing role update for ${to}...`, ephemeral: true });

        const members = await guild.members.fetch();
        let targets = [];

        if (to === "everyone") {
            targets = members;
        } else if (to === "humans") {
            targets = members.filter(m => !m.user.bot);
        } else if (to === "bots") {
            targets = members.filter(m => m.user.bot);
        }

        let added = 0;
        let removed = 0;

        for (const member of targets.values()) {
            if (role.position >= member.roles.highest.position && guild.ownerId !== member.id) continue;

            try {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    removed++;
                } else {
                    await member.roles.add(role);
                    added++;
                }
            } catch (err) {
                console.log(`Failed to update ${member.user.tag}:`, err.message);
            }
        }

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Role Update Complete")
                    .setDescription(`**Role:** ${role}\n**Scope:** ${to}\n✅ Added: ${added}\n🗑️ Removed: ${removed}`)
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }
};
