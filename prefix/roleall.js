const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "roleall",
    aliases: ["ra"],
    run: async (client, message, args) => {
        const msg = await message.channel.send("**Verifying Permissions...**");
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setFooter({ text: `Requested by ${message.author.tag}` });

        // User permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return msg.edit({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | Missing \`Manage Roles\` Permissions.`)
                ]
            });
        }

        // Bot permission check
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return msg.edit({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | Missing \`Manage Roles\` Permissions For me.`)
                ]
            });
        }

        // Argument check
        if (!args || args.length < 2) {
            return msg.edit({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} | Wrong Usage \n\n${client.emoji.arrow} **__?roleall <humans,bots,all> <role (mention, ID, or name)>__**.`
                    )
                ]
            });
        }

        let what = args[0].toLowerCase();
        let membersToAssign;

        if (what === "humans") {
            membersToAssign = message.guild.members.cache.filter(m => !m.user.bot);
        } else if (what === "bots") {
            membersToAssign = message.guild.members.cache.filter(m => m.user.bot);
        } else if (what === "all") {
            membersToAssign = message.guild.members.cache;
        } else {
            return msg.edit({
                embeds: [
                    embed.setDescription(`${client.emoji.cross} | Invalid argument. Use \`humans\`, \`bots\`, or \`all\`.`)
                ]
            });
        }

        // Get role by mention, ID, or name
        let role = message.mentions.roles.first();
        const roleArg = args[1];
        if (!role) {
            role = message.guild.roles.cache.find(
                r => r.id === roleArg || r.name.toLowerCase() === roleArg.toLowerCase()
            );
        }

        if (!role) {
            return msg.edit({
                embeds: [embed.setDescription(`__Role not found! Please mention a valid role or provide a role name or ID.__`)]
            });
        }

        // Count members who do not have the role yet
        let count = 0;
        membersToAssign.forEach(member => {
            if (!member.roles.cache.has(role.id)) {
                count++;
            }
        });

        await msg.edit({
            embeds: [
                embed.setDescription(
                    `${client.emoji.tick} | Assigning Role \n\n${client.emoji.arrow} Total Count: ${count}\n${client.emoji.arrow} Assigning To: ${what}`
                )
            ]
        });

        let successCount = 0;
        let failedCount = 0;
        const reason = `Command run by ${message.author.tag} to assign the role to members missing it in '${what}' category.`;

        // Assign role asynchronously, with audit-log reason
        for (const member of membersToAssign.values()) {
            if (!member.roles.cache.has(role.id)) {
                try {
                    await member.roles.add(role, reason);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to assign role to ${member.user.tag}:`, error);
                    failedCount++;
                }
            }
        }

        await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color || 'BLUE')
                    .setDescription(
                        `**__Role assignment completed!__**\nSuccessfully assigned the role to ${successCount} members.\nFailed to assign the role to ${failedCount} members.`
                    )
            ]
        });
    }
};
