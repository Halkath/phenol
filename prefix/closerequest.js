// commands/closerequest.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const ticketSchema = require("../../Schemas.js/ticketSchema");

module.exports = {
  name: "closerequest",
  description: "Request to close this ticket",
  async execute(client, message, args) {
    const { channel, guild, author, member } = message;

    // ✅ Check if this is a ticket channel
    if (!channel.topic || !channel.topic.includes("Ticket Owner")) {
      return message.reply("❌ This is not a ticket channel.");
    }

    const data = await ticketSchema.findOne({ GuildId: guild.id });
    if (!data) return message.reply("⚠️ Ticket system not set up.");

    const ownerId = channel.topic?.split(": ")[1];
    if (author.id !== ownerId && !member.roles.cache.has(data.Role)) {
      return message.reply("❌ Only the ticket owner or support staff can close this ticket.");
    }

    // ✅ Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setDescription(`Are you sure you want to close this ticket?`)
      .setColor("#ffcc00");

    const confirmButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("yesclose").setLabel("Yes").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("nodont").setLabel("No").setStyle(ButtonStyle.Success)
    );

    // ✅ Send confirmation (same system as your button)
    await message.reply({
      embeds: [confirmEmbed],
      components: [confirmButtons]
    });
  }
};
