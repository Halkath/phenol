const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Displays bot information and stats"),

  async execute(interaction, client) {
    const duration1 = Math.floor((Date.now() - client.uptime) / 1000);

    try {
      const dev = [`[!           D є ν ι ℓ](https://discord.com/users/820684158719492131)`];
      const supp = [`[~ 𝑨𝒍𝒐𝒏𝒆...!!](https://discord.com/users/735003878424313908)`];

      const statsEmbed = new EmbedBuilder()
        .setColor(client.color || "#00c7fe")
        .setAuthor({ name: `${client.user.username}'s Information`, iconURL: client.user.displayAvatarURL() })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(`**BEST MODERATION WITH BEST ANTINUKE FEATURE !!**\n\n<:Sinux_hello:1382064704855347263> **BOT INFO**\n${client.emoji?.arrow || "➤"} Bot Name: \`${client.user.tag}\`\n${client.emoji?.arrow || "➤"} Bot Id: \`${client.user.id}\`\n${client.emoji?.arrow || "➤"} Uptime: <t:${duration1}:R>\n${client.emoji?.arrow || "➤"} Bot Ping: \`${Math.round(client.ws.ping)}ms\`\n<a:sinux_arrow:1088486778157154444> Default Prefix: \`%\`\n\n **STATS**\n${client.emoji.arrow || "➤"} Total Servers: \`${client.guilds.cache.size}\`\n${client.emoji.arrow || "➤"} Total Users: \`${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}\`\n${client.emoji.arrow || "➤"} Total Channels: \`${client.channels.cache.size}\``)
        .addFields(
          { name: `<a:Sinux_developer:1087966726324506685> **DEVELOPER'S**`, value: dev.join(", ") },
          { name: `<a:Sinux_suppoter:1089431786544709642> **SUPPORTER'S**`, value: supp.join(", ") }
        )
        .setFooter({ text: "Thanks for using the bot" });

      await interaction.reply({ embeds: [statsEmbed] });

    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("An Error Occurred")
        .setDescription(`\`\`\`${err.message}\`\`\``);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};

