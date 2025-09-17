const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const saixd = ['735003878424313908', '820684158719492131'];

module.exports = {
  name: "serverslist",
  category: "Owner",
  aliases: ["slist", "sl"],
  description: "Shows servers list",
  usage: "serverslist",
  run: async (client, message, args) => {

    if (!saixd.includes(message.author.id)) return;

    try {
      let servers = [];
      client.guilds.cache
        .sort((a, b) => b.memberCount - a.memberCount)
        .map(r => r)
        .forEach(element => {
          servers.push(element);
        });

      let serverslist = [];
      for (let i = 0; i < servers.length; i += 15) {
        let xservers = servers.slice(i, i + 15);
        serverslist.push(
          xservers
            .map(
              (r, index) =>
                `**${i + (index + 1)}** - ${r.name} | ${r.memberCount} Members\nID: ${r.id}`
            )
            .join("\n")
        );
      }

      let limit = Math.ceil(servers.length / 15);
      let embeds = [];

      for (let i = 0; i < limit; i++) {
        let desc = String(serverslist[i]).substring(0, 4096); // v14 embed max
        embeds.push(
          new EmbedBuilder()
            .setFooter({ text: "Phenol Servers" })
            .setColor(client.color || 0x2f3136)
            .setDescription(desc)
        );
      }

      return paginationxd(client, message, embeds);

    } catch (e) {
      console.log(String(e.stack));
      const emesdf = new EmbedBuilder()
        .setColor(client.color || 0xff0000)
        .setAuthor({ name: "An Error Occurred" })
        .setDescription(`\`\`\`${e.message}\`\`\``);
      return message.channel.send({ embeds: [emesdf] });
    }
  },
};

async function paginationxd(client, message, embeds) {
  let currentPage = 0;

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("⏪")
      .setCustomId("first"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel("⬅️")
      .setCustomId("back"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("❌")
      .setCustomId("home"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel("➡️")
      .setCustomId("next"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("⏩")
      .setCustomId("last")
  );

  if (embeds.length === 1) return message.channel.send({ embeds: [embeds[0]] });

  const queueEmbed = await message.channel.send({
    content: `**Current Page - ${currentPage + 1}/${embeds.length}**`,
    components: [buttonRow],
    embeds: [embeds[currentPage]]
  });

  const collector = queueEmbed.createMessageComponentCollector({
    filter: (interaction) => interaction.user.id === message.author.id,
    time: 120000 // 2 mins timeout
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "next") {
      currentPage = currentPage < embeds.length - 1 ? currentPage + 1 : 0;
    } else if (interaction.customId === "back") {
      currentPage = currentPage > 0 ? currentPage - 1 : embeds.length - 1;
    } else if (interaction.customId === "first") {
      currentPage = 0;
    } else if (interaction.customId === "last") {
      currentPage = embeds.length - 1;
    } else if (interaction.customId === "home") {
      collector.stop();
      return interaction.update({ content: "Closed pagination.", embeds: [], components: [] });
    }

    await interaction.update({
      content: `**Current Page - ${currentPage + 1}/${embeds.length}**`,
      embeds: [embeds[currentPage]],
      components: [buttonRow]
    });
  });

  collector.on("end", () => {
    if (!queueEmbed.deleted) {
      queueEmbed.edit({ components: [] }).catch(() => {});
    }
  });
}

