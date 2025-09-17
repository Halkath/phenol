const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "roleinfo",
  aliases: ["ri"],
  category: "info",
  description: "Get information about a role",
  run: async (client, message, args) => {
    let role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.get(args[0]);

    if (!role) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(client.emoji.cross +" | You didn't provide a valid role."),
        ],
      });
    }

    let color = role.color === 0 ? "#000000" : role.hexColor;
    let created = `<t:${Math.round(role.createdTimestamp / 1000)}:R>`;

    const permissions =
      role.permissions.has(PermissionsBitField.Flags.Administrator) ?
        ["`ADMINISTRATOR`"] :
        role.permissions
          .toArray()
          .sort((a, b) => a.localeCompare(b))
          .map((p) => `\`${p}\``);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${role.name}'s Information`,
        iconURL: client.user.displayAvatarURL(),
      })
      .addFields(
        {
          name: "General Info",
          value: `**Role Name:** ${role.name}\n**Role ID:** \`${role.id}\`\n**Position:** ${role.rawPosition}\n**Hex Code:** \`${color}\`\n**Created:** ${created}\n**Mentionable:** ${role.mentionable}\n**Managed (Integration):** ${role.managed}`,
        },
        {
          name: "Allowed Permissions",
          value: permissions.join(", ") || "No Permissions",
        }
      )
      .setColor(color === "#000000" ? "#000001" : color);

    await message.reply({ embeds: [embed] });
  },
};
